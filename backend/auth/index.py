import json
import os
import secrets
import hashlib
import psycopg2
from datetime import datetime, timedelta

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

def handler(event: dict, context) -> dict:
    """Аутентификация: регистрация, вход, выход, получение профиля"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    # GET /auth/me or GET /
    if method == 'GET' and (path.endswith('/me') or path == '/'):
        if not token:
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'No token'})}
        conn = get_db()
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT u.id, u.phone, u.name, u.role, u.status, u.avatar_url, u.bonus_points, u.orders_count, u.total_spent, u.created_at "
                "FROM sessions s JOIN users u ON s.user_id = u.id "
                "WHERE s.token = %s AND s.expires_at > NOW()", (token,)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Invalid or expired token'})}
            user_id, phone, name, role, status, avatar_url, bonus_points, orders_count, total_spent, created_at = row
            user_data = {
                'id': user_id,
                'phone': phone,
                'name': name,
                'role': role,
                'status': status,
                'avatar_url': avatar_url or '',
                'bonus_points': bonus_points or 0,
                'orders_count': orders_count or 0,
                'total_spent': float(total_spent or 0),
                'created_at': created_at.isoformat() if created_at else ''
            }
            # Если продавец — добавим seller_profile
            if role == 'seller':
                cur.execute(
                    "SELECT id, shop_name, description, contact_phone, status, city, logo, bonus_points, total_sales, total_revenue, products_count, inn, ogrn "
                    "FROM seller_profiles WHERE user_id = %s", (user_id,)
                )
                sp = cur.fetchone()
                if sp:
                    user_data['seller_profile'] = {
                        'id': sp[0], 'shop_name': sp[1], 'description': sp[2],
                        'contact_phone': sp[3], 'status': sp[4], 'city': sp[5] or '',
                        'logo': sp[6] or '', 'bonus_points': sp[7] or 0,
                        'total_sales': sp[8] or 0, 'total_revenue': float(sp[9] or 0),
                        'products_count': sp[10] or 0, 'inn': sp[11] or '', 'ogrn': sp[12] or ''
                    }
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(user_data)}
        finally:
            conn.close()

    # POST /auth/send-otp
    if method == 'POST' and path.endswith('/send-otp'):
        body = json.loads(event.get('body') or '{}')
        phone = (body.get('phone') or '').strip().replace(' ', '').replace('-', '')
        if not phone:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Phone required'})}
        # В режиме dev OTP всегда 1234
        otp_code = '1234'
        conn = get_db()
        try:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO otp_codes (phone, code, expires_at) VALUES (%s, %s, NOW() + INTERVAL '10 minutes')",
                (phone, otp_code)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True, 'message': 'OTP sent (dev: 1234)'})}
        finally:
            conn.close()

    # POST /auth/login
    if method == 'POST' and path.endswith('/login'):
        body = json.loads(event.get('body') or '{}')
        phone = (body.get('phone') or '').strip().replace(' ', '').replace('-', '')
        otp = (body.get('otp') or '').strip()
        if not phone or not otp:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Phone and OTP required'})}
        conn = get_db()
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT id FROM otp_codes WHERE phone = %s AND code = %s AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
                (phone, otp)
            )
            otp_row = cur.fetchone()
            if not otp_row:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Invalid or expired OTP'})}
            cur.execute("UPDATE otp_codes SET used = TRUE WHERE id = %s", (otp_row[0],))
            cur.execute("SELECT id, phone, name, role, status, avatar_url, bonus_points FROM users WHERE phone = %s", (phone,))
            user = cur.fetchone()
            if not user:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'User not found. Please register first.'})}
            user_id = user[0]
            token = secrets.token_hex(32)
            cur.execute(
                "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, NOW() + INTERVAL '30 days')",
                (user_id, token)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({
                'token': token,
                'user': {'id': user[0], 'phone': user[1], 'name': user[2], 'role': user[3], 'status': user[4], 'avatar_url': user[5] or '', 'bonus_points': user[6] or 0}
            })}
        finally:
            conn.close()

    # POST /auth/register
    if method == 'POST' and path.endswith('/register'):
        body = json.loads(event.get('body') or '{}')
        phone = (body.get('phone') or '').strip().replace(' ', '').replace('-', '')
        name = (body.get('name') or '').strip()
        otp = (body.get('otp') or '').strip()
        if not phone or not name or not otp:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Phone, name and OTP required'})}
        conn = get_db()
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT id FROM otp_codes WHERE phone = %s AND code = %s AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
                (phone, otp)
            )
            otp_row = cur.fetchone()
            if not otp_row:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Invalid or expired OTP'})}
            cur.execute("UPDATE otp_codes SET used = TRUE WHERE id = %s", (otp_row[0],))
            cur.execute("SELECT id FROM users WHERE phone = %s", (phone,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'User already exists'})}
            cur.execute(
                "INSERT INTO users (phone, name, role, status) VALUES (%s, %s, 'buyer', 'active') RETURNING id",
                (phone, name)
            )
            user_id = cur.fetchone()[0]
            token = secrets.token_hex(32)
            cur.execute(
                "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, NOW() + INTERVAL '30 days')",
                (user_id, token)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({
                'token': token,
                'user': {'id': user_id, 'phone': phone, 'name': name, 'role': 'buyer', 'status': 'active', 'avatar_url': '', 'bonus_points': 0}
            })}
        finally:
            conn.close()

    # POST /auth/logout
    if method == 'POST' and path.endswith('/logout'):
        if token:
            conn = get_db()
            try:
                cur = conn.cursor()
                cur.execute("UPDATE sessions SET expires_at = NOW() WHERE token = %s", (token,))
                conn.commit()
            finally:
                conn.close()
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

    return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}