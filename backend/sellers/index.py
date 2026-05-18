import json
import os
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id, X-Authorization',
    'Content-Type': 'application/json'
}

def get_db():
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn, options=f'-c search_path={schema}')
    conn.autocommit = False
    return conn

def get_user_from_token(cur, token):
    if not token:
        return None
    cur.execute(
        "SELECT u.id, u.role, u.status FROM sessions s JOIN users u ON s.user_id = u.id "
        "WHERE s.token = %s AND s.expires_at > NOW()", (token,)
    )
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    """Магазины: регистрация, профиль, список, управление документами"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    conn = get_db()
    try:
        cur = conn.cursor()

        # GET /sellers — список магазинов
        if method == 'GET' and (path.endswith('/sellers') or path == '/'):
            cur.execute("""
                SELECT sp.id, sp.shop_name, sp.description, sp.city, sp.logo,
                       sp.status, sp.total_sales, sp.total_revenue, sp.products_count,
                       sp.bonus_points, sp.created_at, sp.contact_phone,
                       u.id AS user_id, u.name AS owner_name
                FROM seller_profiles sp
                JOIN users u ON sp.user_id = u.id
                WHERE sp.status = 'approved'
                ORDER BY sp.total_sales DESC
            """)
            rows = cur.fetchall()
            sellers = []
            for r in rows:
                sellers.append({
                    'id': r[0], 'shop_name': r[1], 'description': r[2] or '',
                    'city': r[3] or '', 'logo': r[4] or '', 'status': r[5],
                    'total_sales': r[6] or 0, 'total_revenue': float(r[7] or 0),
                    'products_count': r[8] or 0, 'bonus_points': r[9] or 0,
                    'created_at': r[10].isoformat() if r[10] else '',
                    'contact_phone': r[11] or '', 'user_id': r[12], 'owner_name': r[13]
                })
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'sellers': sellers})}

        # GET /sellers/{id}
        if method == 'GET' and '/sellers/' in path and '/documents' not in path:
            seller_id = path.split('/')[-1]
            cur.execute("""
                SELECT sp.id, sp.shop_name, sp.description, sp.city, sp.logo,
                       sp.banner_url, sp.status, sp.total_sales, sp.total_revenue,
                       sp.products_count, sp.bonus_points, sp.created_at, sp.contact_phone,
                       sp.inn, sp.ogrn, u.id AS user_id, u.name AS owner_name
                FROM seller_profiles sp
                JOIN users u ON sp.user_id = u.id
                WHERE sp.id = %s
            """, (seller_id,))
            r = cur.fetchone()
            if not r:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
            seller = {
                'id': r[0], 'shop_name': r[1], 'description': r[2] or '',
                'city': r[3] or '', 'logo': r[4] or '', 'banner_url': r[5] or '',
                'status': r[6], 'total_sales': r[7] or 0, 'total_revenue': float(r[8] or 0),
                'products_count': r[9] or 0, 'bonus_points': r[10] or 0,
                'created_at': r[11].isoformat() if r[11] else '',
                'contact_phone': r[12] or '', 'inn': r[13] or '', 'ogrn': r[14] or '',
                'user_id': r[15], 'owner_name': r[16]
            }
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(seller)}

        # POST /sellers/register — регистрация магазина
        if method == 'POST' and path.endswith('/register'):
            user = get_user_from_token(cur, token)
            if not user:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unauthorized'})}
            user_id, role, status = user
            cur.execute("SELECT id FROM seller_profiles WHERE user_id = %s", (user_id,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Seller profile already exists'})}
            body = json.loads(event.get('body') or '{}')
            shop_name = body.get('shop_name', '').strip()
            if not shop_name:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'shop_name required'})}
            cur.execute("""
                INSERT INTO seller_profiles (user_id, shop_name, description, contact_email, contact_phone, city, address, inn, ogrn, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending') RETURNING id
            """, (
                user_id, shop_name, body.get('description', ''),
                body.get('contact_email', ''), body.get('contact_phone', ''),
                body.get('city', ''), body.get('address', ''),
                body.get('inn', ''), body.get('ogrn', '')
            ))
            sp_id = cur.fetchone()[0]
            cur.execute("UPDATE users SET role = 'seller' WHERE id = %s", (user_id,))
            conn.commit()
            return {'statusCode': 201, 'headers': CORS_HEADERS, 'body': json.dumps({'id': sp_id})}

        # PUT /sellers/{id} — обновить профиль
        if method == 'PUT' and '/sellers/' in path:
            user = get_user_from_token(cur, token)
            if not user:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unauthorized'})}
            user_id, role, _ = user
            seller_id = path.split('/')[-1]
            cur.execute("SELECT user_id FROM seller_profiles WHERE id = %s", (seller_id,))
            sp = cur.fetchone()
            if not sp:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
            if sp[0] != user_id and role != 'moderator':
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Forbidden'})}
            body = json.loads(event.get('body') or '{}')
            allowed = ['shop_name', 'description', 'contact_phone', 'contact_email', 'city', 'address', 'logo', 'banner_url', 'inn', 'ogrn']
            if role == 'moderator':
                allowed += ['status', 'rejection_reason', 'bonus_points']
            fields = []
            vals = []
            for f in allowed:
                if f in body:
                    fields.append(f"{f} = %s")
                    vals.append(body[f])
            if not fields:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Nothing to update'})}
            vals.append(seller_id)
            cur.execute(f"UPDATE seller_profiles SET {', '.join(fields)}, updated_at = NOW() WHERE id = %s", vals)
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()