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
        "SELECT u.id, u.role, u.status, u.name FROM sessions s JOIN users u ON s.user_id = u.id "
        "WHERE s.token = %s AND s.expires_at > NOW()", (token,)
    )
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    """Переговоры (торг): создание, просмотр, отправка сообщений, принятие/отклонение цены"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    conn = get_db()
    try:
        cur = conn.cursor()
        user = get_user_from_token(cur, token)
        if not user:
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unauthorized'})}
        user_id, role, user_status, user_name = user

        # GET /negotiations — мои переговоры
        if method == 'GET' and (path.endswith('/negotiations') or path == '/'):
            if role == 'buyer':
                cur.execute("""
                    SELECT n.id, n.product_id, n.buyer_id, n.seller_id, n.status,
                           n.offered_price, n.final_price, n.created_at, n.updated_at,
                           p.title, p.price, p.images,
                           sp.shop_name,
                           u_b.name AS buyer_name
                    FROM negotiations n
                    JOIN products p ON n.product_id = p.id
                    JOIN seller_profiles sp ON n.seller_id = sp.id
                    JOIN users u_b ON n.buyer_id = u_b.id
                    WHERE n.buyer_id = %s
                    ORDER BY n.updated_at DESC
                """, (user_id,))
            elif role == 'seller':
                cur.execute("SELECT id FROM seller_profiles WHERE user_id = %s", (user_id,))
                sp = cur.fetchone()
                if not sp:
                    return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'negotiations': []})}
                cur.execute("""
                    SELECT n.id, n.product_id, n.buyer_id, n.seller_id, n.status,
                           n.offered_price, n.final_price, n.created_at, n.updated_at,
                           p.title, p.price, p.images,
                           sp.shop_name,
                           u_b.name AS buyer_name
                    FROM negotiations n
                    JOIN products p ON n.product_id = p.id
                    JOIN seller_profiles sp ON n.seller_id = sp.id
                    JOIN users u_b ON n.buyer_id = u_b.id
                    WHERE n.seller_id = %s
                    ORDER BY n.updated_at DESC
                """, (sp[0],))
            else:  # moderator — все
                cur.execute("""
                    SELECT n.id, n.product_id, n.buyer_id, n.seller_id, n.status,
                           n.offered_price, n.final_price, n.created_at, n.updated_at,
                           p.title, p.price, p.images,
                           sp.shop_name,
                           u_b.name AS buyer_name
                    FROM negotiations n
                    JOIN products p ON n.product_id = p.id
                    JOIN seller_profiles sp ON n.seller_id = sp.id
                    JOIN users u_b ON n.buyer_id = u_b.id
                    ORDER BY n.updated_at DESC
                    LIMIT 200
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
                    'product': {'title': r[9], 'price': float(r[10]), 'images': r[11] or []},
                    'shop_name': r[12], 'buyer_name': r[13]
                })
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'negotiations': negotiations})}

        # POST /negotiations — начать переговор
        if method == 'POST' and (path.endswith('/negotiations') or path == '/'):
            if role != 'buyer':
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Only buyers can start negotiations'})}
            body = json.loads(event.get('body') or '{}')
            product_id = body.get('product_id')
            offered_price = body.get('offered_price')
            message = body.get('message', '')
            if not product_id or not offered_price:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'product_id and offered_price required'})}
            # Получим товар и продавца
            cur.execute("SELECT id, seller_id, price, title FROM products WHERE id = %s AND status = 'active'", (product_id,))
            prod = cur.fetchone()
            if not prod:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Product not found'})}
            # Найдём seller_profile
            cur.execute("SELECT id FROM seller_profiles WHERE user_id = %s", (prod[1],))
            sp = cur.fetchone()
            if not sp:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Seller profile not found'})}
            seller_profile_id = sp[0]
            # Проверим нет ли уже активных переговоров
            cur.execute("SELECT id FROM negotiations WHERE product_id = %s AND buyer_id = %s AND status IN ('pending', 'active')", (product_id, user_id))
            existing = cur.fetchone()
            if existing:
                return {'statusCode': 409, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Negotiation already exists', 'id': existing[0]})}
            cur.execute("""
                INSERT INTO negotiations (product_id, buyer_id, seller_id, status, offered_price, buyer_message)
                VALUES (%s, %s, %s, 'pending', %s, %s) RETURNING id
            """, (product_id, user_id, seller_profile_id, float(offered_price), message))
            neg_id = cur.fetchone()[0]
            # Добавим первое сообщение
            cur.execute("""
                INSERT INTO negotiation_messages (negotiation_id, sender_id, sender_role, price, message, action)
                VALUES (%s, %s, 'buyer', %s, %s, 'offer')
            """, (neg_id, user_id, float(offered_price), message or f'Предлагаю {offered_price} руб.'))
            conn.commit()
            return {'statusCode': 201, 'headers': CORS_HEADERS, 'body': json.dumps({'id': neg_id})}

        # GET /negotiations/{id}/messages
        if method == 'GET' and '/messages' in path:
            neg_id = path.split('/')[-2]
            cur.execute("SELECT buyer_id, seller_id FROM negotiations WHERE id = %s", (neg_id,))
            neg = cur.fetchone()
            if not neg:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
            if role not in ('moderator',):
                cur.execute("SELECT id FROM seller_profiles WHERE user_id = %s", (user_id,))
                sp = cur.fetchone()
                sp_id = sp[0] if sp else None
                if neg[0] != user_id and neg[1] != sp_id:
                    return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Forbidden'})}
            cur.execute("""
                SELECT m.id, m.sender_id, m.sender_role, m.price, m.message, m.action, m.created_at,
                       u.name AS sender_name
                FROM negotiation_messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.negotiation_id = %s
                ORDER BY m.created_at ASC
            """, (neg_id,))
            rows = cur.fetchall()
            messages = [{'id': r[0], 'sender_id': r[1], 'sender_role': r[2], 'price': float(r[3]) if r[3] else None, 'message': r[4], 'action': r[5], 'created_at': r[6].isoformat() if r[6] else '', 'sender_name': r[7]} for r in rows]
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'messages': messages})}

        # POST /negotiations/{id}/messages
        if method == 'POST' and '/messages' in path:
            neg_id = path.split('/')[-2]
            cur.execute("SELECT buyer_id, seller_id, status FROM negotiations WHERE id = %s", (neg_id,))
            neg = cur.fetchone()
            if not neg:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
            if neg[2] in ('accepted', 'rejected', 'cancelled'):
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Negotiation is closed'})}
            cur.execute("SELECT id FROM seller_profiles WHERE user_id = %s", (user_id,))
            sp = cur.fetchone()
            sp_id = sp[0] if sp else None
            if neg[0] != user_id and neg[1] != sp_id and role != 'moderator':
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Forbidden'})}
            body = json.loads(event.get('body') or '{}')
            action = body.get('action', 'message')
            message = body.get('message', '')
            price = body.get('price')
            sender_role = 'buyer' if neg[0] == user_id else 'seller'
            if role == 'moderator':
                sender_role = 'moderator'
            cur.execute("""
                INSERT INTO negotiation_messages (negotiation_id, sender_id, sender_role, price, message, action)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
            """, (neg_id, user_id, sender_role, float(price) if price else None, message, action))
            msg_id = cur.fetchone()[0]
            # Обновим статус переговора если нужно
            if action == 'accept':
                cur.execute("UPDATE negotiations SET status = 'accepted', final_price = %s, updated_at = NOW() WHERE id = %s", (price or neg[2], neg_id))
            elif action == 'reject':
                cur.execute("UPDATE negotiations SET status = 'rejected', updated_at = NOW() WHERE id = %s", (neg_id,))
            elif action == 'counter_offer' and price:
                cur.execute("UPDATE negotiations SET offered_price = %s, status = 'pending', updated_at = NOW() WHERE id = %s", (float(price), neg_id))
            else:
                cur.execute("UPDATE negotiations SET updated_at = NOW() WHERE id = %s", (neg_id,))
            conn.commit()
            return {'statusCode': 201, 'headers': CORS_HEADERS, 'body': json.dumps({'id': msg_id})}

        # PUT /negotiations/{id} — изменить статус (модератор или участники)
        if method == 'PUT' and '/negotiations/' in path and '/messages' not in path:
            neg_id = path.split('/')[-1]
            body = json.loads(event.get('body') or '{}')
            new_status = body.get('status')
            note = body.get('moderator_note', '')
            cur.execute("SELECT buyer_id, seller_id, status FROM negotiations WHERE id = %s", (neg_id,))
            neg = cur.fetchone()
            if not neg:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
            cur.execute("SELECT id FROM seller_profiles WHERE user_id = %s", (user_id,))
            sp = cur.fetchone()
            sp_id = sp[0] if sp else None
            if neg[0] != user_id and neg[1] != sp_id and role != 'moderator':
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Forbidden'})}
            if new_status:
                cur.execute("UPDATE negotiations SET status = %s, moderator_note = %s, updated_at = NOW() WHERE id = %s", (new_status, note, neg_id))
                conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()