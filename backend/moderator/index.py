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

def require_moderator(cur, token):
    if not token:
        return None
    cur.execute(
        "SELECT u.id, u.role FROM sessions s JOIN users u ON s.user_id = u.id "
        "WHERE s.token = %s AND s.expires_at > NOW()", (token,)
    )
    row = cur.fetchone()
    if not row or row[1] != 'moderator':
        return None
    return row[0]

def handler(event: dict, context) -> dict:
    """Модераторская панель: управление магазинами, пользователями, переговорами, статистика"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    conn = get_db()
    try:
        cur = conn.cursor()
        mod_id = require_moderator(cur, token)
        if not mod_id:
            return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Forbidden: moderator only'})}

        # GET / or GET /moderator/stats
        if method == 'GET' and (path == '/' or path.endswith('/stats')):
            cur.execute("SELECT COUNT(*) FROM users WHERE role = 'buyer'")
            buyers_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM users WHERE role = 'seller'")
            sellers_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM seller_profiles")
            shops_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM seller_profiles WHERE status = 'pending'")
            pending_shops = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM products WHERE status = 'active'")
            products_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM negotiations")
            negotiations_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM negotiations WHERE status = 'accepted'")
            deals_count = cur.fetchone()[0]
            cur.execute("SELECT COALESCE(SUM(final_price), 0) FROM negotiations WHERE status = 'accepted'")
            total_revenue = float(cur.fetchone()[0])
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({
                'buyers_count': buyers_count,
                'sellers_count': sellers_count,
                'shops_count': shops_count,
                'pending_shops': pending_shops,
                'products_count': products_count,
                'negotiations_count': negotiations_count,
                'deals_count': deals_count,
                'total_revenue': total_revenue
            })}

        # GET /moderator/shops — все магазины
        if method == 'GET' and path.endswith('/shops'):
            cur.execute("""
                SELECT sp.id, sp.shop_name, sp.description, sp.status, sp.city,
                       sp.contact_phone, sp.inn, sp.ogrn, sp.total_sales,
                       sp.total_revenue, sp.products_count, sp.bonus_points,
                       sp.created_at, sp.rejection_reason,
                       u.id AS user_id, u.name AS owner_name, u.phone AS owner_phone
                FROM seller_profiles sp
                JOIN users u ON sp.user_id = u.id
                ORDER BY sp.created_at DESC
            """)
            rows = cur.fetchall()
            shops = []
            for r in rows:
                shops.append({
                    'id': r[0], 'shop_name': r[1], 'description': r[2] or '',
                    'status': r[3], 'city': r[4] or '', 'contact_phone': r[5] or '',
                    'inn': r[6] or '', 'ogrn': r[7] or '', 'total_sales': r[8] or 0,
                    'total_revenue': float(r[9] or 0), 'products_count': r[10] or 0,
                    'bonus_points': r[11] or 0, 'created_at': r[12].isoformat() if r[12] else '',
                    'rejection_reason': r[13] or '', 'user_id': r[14],
                    'owner_name': r[15], 'owner_phone': r[16]
                })
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'shops': shops})}

        # PUT /moderator/shops/{id} — одобрить/отклонить/заблокировать
        if method == 'PUT' and '/shops/' in path:
            shop_id = path.split('/')[-1]
            body = json.loads(event.get('body') or '{}')
            new_status = body.get('status')
            rejection_reason = body.get('rejection_reason', '')
            bonus_points = body.get('bonus_points')
            if new_status:
                cur.execute(
                    "UPDATE seller_profiles SET status = %s, rejection_reason = %s, updated_at = NOW() WHERE id = %s",
                    (new_status, rejection_reason, shop_id)
                )
            if bonus_points is not None:
                cur.execute("UPDATE seller_profiles SET bonus_points = %s WHERE id = %s", (int(bonus_points), shop_id))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

        # GET /moderator/users — все пользователи
        if method == 'GET' and path.endswith('/users'):
            cur.execute("""
                SELECT id, phone, name, role, status, bonus_points, orders_count, total_spent, created_at
                FROM users
                ORDER BY created_at DESC
            """)
            rows = cur.fetchall()
            users = [{'id': r[0], 'phone': r[1], 'name': r[2], 'role': r[3], 'status': r[4], 'bonus_points': r[5] or 0, 'orders_count': r[6] or 0, 'total_spent': float(r[7] or 0), 'created_at': r[8].isoformat() if r[8] else ''} for r in rows]
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'users': users})}

        # PUT /moderator/users/{id} — заблокировать/разблокировать/изменить бонусы
        if method == 'PUT' and '/users/' in path:
            user_id = path.split('/')[-1]
            body = json.loads(event.get('body') or '{}')
            fields = []
            vals = []
            for f in ['status', 'bonus_points', 'role']:
                if f in body:
                    fields.append(f"{f} = %s")
                    vals.append(body[f])
            if not fields:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Nothing to update'})}
            vals.append(user_id)
            cur.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = %s", vals)
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

        # GET /moderator/negotiations — все переговоры
        if method == 'GET' and path.endswith('/negotiations'):
            cur.execute("""
                SELECT n.id, n.product_id, n.buyer_id, n.seller_id, n.status,
                       n.offered_price, n.final_price, n.created_at, n.updated_at,
                       n.moderator_note,
                       p.title AS product_title, p.price AS product_price,
                       sp.shop_name,
                       u_b.name AS buyer_name, u_b.phone AS buyer_phone
                FROM negotiations n
                JOIN products p ON n.product_id = p.id
                JOIN seller_profiles sp ON n.seller_id = sp.id
                JOIN users u_b ON n.buyer_id = u_b.id
                ORDER BY n.updated_at DESC
                LIMIT 500
            """)
            rows = cur.fetchall()
            negotiations = []
            for r in rows:
                negotiations.append({
                    'id': r[0], 'product_id': r[1], 'buyer_id': r[2], 'seller_id': r[3],
                    'status': r[4], 'offered_price': float(r[5]) if r[5] else None,
                    'final_price': float(r[6]) if r[6] else None,
                    'created_at': r[7].isoformat() if r[7] else '',
                    'updated_at': r[8].isoformat() if r[8] else '',
                    'moderator_note': r[9] or '',
                    'product_title': r[10], 'product_price': float(r[11]),
                    'shop_name': r[12], 'buyer_name': r[13], 'buyer_phone': r[14]
                })
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'negotiations': negotiations})}

        # PUT /moderator/negotiations/{id} — вмешаться в переговор
        if method == 'PUT' and '/negotiations/' in path:
            neg_id = path.split('/')[-1]
            body = json.loads(event.get('body') or '{}')
            new_status = body.get('status')
            note = body.get('moderator_note', '')
            if not new_status:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'status required'})}
            cur.execute(
                "UPDATE negotiations SET status = %s, moderator_note = %s, updated_at = NOW() WHERE id = %s",
                (new_status, note, neg_id)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

        # GET /moderator/products — все товары
        if method == 'GET' and path.endswith('/products'):
            cur.execute("""
                SELECT p.id, p.title, p.price, p.status, p.in_stock, p.views,
                       p.rating, p.reviews_count, p.created_at,
                       c.name AS category_name,
                       sp.shop_name, u.name AS seller_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id
                LEFT JOIN users u ON p.seller_id = u.id
                WHERE p.status != 'deleted'
                ORDER BY p.created_at DESC
                LIMIT 500
            """)
            rows = cur.fetchall()
            products = [{'id': r[0], 'title': r[1], 'price': float(r[2]), 'status': r[3], 'in_stock': r[4], 'views': r[5] or 0, 'rating': float(r[6] or 0), 'reviews_count': r[7] or 0, 'created_at': r[8].isoformat() if r[8] else '', 'category_name': r[9] or '', 'shop_name': r[10] or '', 'seller_name': r[11] or ''} for r in rows]
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'products': products})}

        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()