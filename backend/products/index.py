import json
import os
import base64
import uuid
import psycopg2
import boto3

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
    """Управление товарами: каталог, добавление, редактирование, удаление"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    params = event.get('queryStringParameters') or {}

    conn = get_db()
    try:
        cur = conn.cursor()

        # GET /products — список товаров
        if method == 'GET' and (path.endswith('/products') or path == '/'):
            category = params.get('category', '')
            search = params.get('search', '')
            seller_id = params.get('seller_id', '')
            limit = int(params.get('limit', 50))
            offset = int(params.get('offset', 0))

            where = ["p.status = 'active'"]
            args = []
            if category:
                where.append("c.slug = %s")
                args.append(category)
            if search:
                where.append("(p.title ILIKE %s OR p.description ILIKE %s)")
                args.extend([f'%{search}%', f'%{search}%'])
            if seller_id:
                where.append("sp.id = %s")
                args.append(seller_id)

            where_clause = ' AND '.join(where)
            args.extend([limit, offset])

            cur.execute(f"""
                SELECT p.id, p.title, p.description, p.price, p.original_price,
                       p.images, p.in_stock, p.rating, p.reviews_count, p.article,
                       p.allow_negotiation, p.views, p.created_at,
                       c.name AS category_name, c.slug AS category_slug,
                       sp.id AS seller_id, sp.shop_name, sp.city, sp.logo, sp.status AS seller_status
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id
                WHERE {where_clause}
                ORDER BY p.created_at DESC
                LIMIT %s OFFSET %s
            """, args)

            rows = cur.fetchall()
            products = []
            for r in rows:
                products.append({
                    'id': r[0], 'title': r[1], 'description': r[2] or '',
                    'price': float(r[3]), 'original_price': float(r[4]) if r[4] else None,
                    'images': r[5] or [], 'in_stock': r[6], 'rating': float(r[7] or 0),
                    'reviews_count': r[8] or 0, 'article': r[9] or '',
                    'allow_negotiation': r[10], 'views': r[11] or 0,
                    'created_at': r[12].isoformat() if r[12] else '',
                    'category': {'name': r[13] or '', 'slug': r[14] or ''},
                    'seller': {'id': r[15], 'shop_name': r[16] or '', 'city': r[17] or '', 'logo': r[18] or '', 'status': r[19] or ''}
                })
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'products': products})}

        # GET /products/{id}
        if method == 'GET' and '/products/' in path:
            product_id = path.split('/')[-1]
            cur.execute("""
                SELECT p.id, p.title, p.description, p.price, p.original_price,
                       p.images, p.in_stock, p.rating, p.reviews_count, p.article,
                       p.allow_negotiation, p.views, p.created_at,
                       c.name AS category_name, c.slug AS category_slug,
                       sp.id AS seller_id, sp.shop_name, sp.city, sp.logo, sp.status AS seller_status
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id
                WHERE p.id = %s AND p.status != 'deleted'
            """, (product_id,))
            r = cur.fetchone()
            if not r:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
            cur.execute("UPDATE products SET views = views + 1 WHERE id = %s", (product_id,))
            conn.commit()
            product = {
                'id': r[0], 'title': r[1], 'description': r[2] or '',
                'price': float(r[3]), 'original_price': float(r[4]) if r[4] else None,
                'images': r[5] or [], 'in_stock': r[6], 'rating': float(r[7] or 0),
                'reviews_count': r[8] or 0, 'article': r[9] or '',
                'allow_negotiation': r[10], 'views': r[11] or 0,
                'created_at': r[12].isoformat() if r[12] else '',
                'category': {'name': r[13] or '', 'slug': r[14] or ''},
                'seller': {'id': r[15], 'shop_name': r[16] or '', 'city': r[17] or '', 'logo': r[18] or '', 'status': r[19] or ''}
            }
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(product)}

        # POST /products — создать товар
        if method == 'POST':
            user = get_user_from_token(cur, token)
            if not user:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unauthorized'})}
            user_id, role, status = user
            if role not in ('seller', 'moderator'):
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Only sellers can add products'})}
            body = json.loads(event.get('body') or '{}')
            title = body.get('title', '').strip()
            price = body.get('price')
            if not title or not price:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Title and price required'})}
            # Проверим статус магазина
            cur.execute("SELECT id, status FROM seller_profiles WHERE user_id = %s", (user_id,))
            sp = cur.fetchone()
            if not sp:
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'No seller profile'})}
            if sp[1] != 'approved' and role != 'moderator':
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Shop not approved yet'})}
            category_id = body.get('category_id')
            cur.execute("""
                INSERT INTO products (seller_id, title, description, price, original_price, category_id, images, in_stock, allow_negotiation, article, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'active') RETURNING id
            """, (
                user_id, title, body.get('description', ''), float(price),
                float(body['original_price']) if body.get('original_price') else None,
                category_id, body.get('images', []),
                body.get('in_stock', True), body.get('allow_negotiation', True),
                body.get('article', '')
            ))
            product_id = cur.fetchone()[0]
            cur.execute("UPDATE seller_profiles SET products_count = products_count + 1 WHERE user_id = %s", (user_id,))
            conn.commit()
            return {'statusCode': 201, 'headers': CORS_HEADERS, 'body': json.dumps({'id': product_id})}

        # PUT /products/{id}
        if method == 'PUT' and '/products/' in path:
            user = get_user_from_token(cur, token)
            if not user:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unauthorized'})}
            user_id, role, status = user
            product_id = path.split('/')[-1]
            cur.execute("SELECT seller_id, status FROM products WHERE id = %s", (product_id,))
            prod = cur.fetchone()
            if not prod:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
            if prod[0] != user_id and role not in ('moderator',):
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Forbidden'})}
            body = json.loads(event.get('body') or '{}')
            fields = []
            vals = []
            for field in ['title', 'description', 'price', 'original_price', 'category_id', 'images', 'in_stock', 'allow_negotiation', 'article', 'status']:
                if field in body:
                    fields.append(f"{field} = %s")
                    vals.append(body[field])
            if not fields:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Nothing to update'})}
            vals.append(product_id)
            cur.execute(f"UPDATE products SET {', '.join(fields)}, updated_at = NOW() WHERE id = %s", vals)
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

        # DELETE /products/{id} — скрыть товар
        if method == 'DELETE' and '/products/' in path:
            user = get_user_from_token(cur, token)
            if not user:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unauthorized'})}
            user_id, role, _ = user
            product_id = path.split('/')[-1]
            cur.execute("SELECT seller_id FROM products WHERE id = %s", (product_id,))
            prod = cur.fetchone()
            if not prod:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
            if prod[0] != user_id and role != 'moderator':
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Forbidden'})}
            cur.execute("UPDATE products SET status = 'deleted' WHERE id = %s", (product_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

        # POST /upload — загрузка файла в S3
        if method == 'POST' and path.endswith('/upload'):
            user = get_user_from_token(cur, token)
            if not user:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unauthorized'})}
            body = json.loads(event.get('body') or '{}')
            file_data = body.get('file')
            file_name = body.get('name', 'image.jpg')
            folder = body.get('folder', 'uploads')
            if not file_data:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'No file data'})}
            if ',' in file_data:
                file_data = file_data.split(',', 1)[1]
            file_bytes = base64.b64decode(file_data)
            ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else 'jpg'
            content_type_map = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'webp': 'image/webp'}
            content_type = content_type_map.get(ext, 'application/octet-stream')
            key = f"{folder}/{uuid.uuid4()}.{ext}"
            s3 = boto3.client('s3', endpoint_url='https://bucket.poehali.dev', aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'], aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
            s3.put_object(Bucket='files', Key=key, Body=file_bytes, ContentType=content_type)
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'url': cdn_url, 'key': key})}

        # GET /categories
        if method == 'GET' and path.endswith('/categories'):
            cur.execute("SELECT id, name, slug, icon FROM categories ORDER BY sort_order ASC, id ASC")
            rows = cur.fetchall()
            categories = [{'id': r[0], 'name': r[1], 'slug': r[2], 'icon': r[3] or ''} for r in rows]
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'categories': categories})}

        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()