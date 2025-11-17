# API Commerce (ApiComerceE2)

Resumen y documentación de la API del proyecto.

**Requisitos**
- Node.js >= 18 (probado con Node 18+)
- MongoDB (local o remoto)

**Instalación**

1. Clonar el repo y entrar en la carpeta:
```
git clone <repo-url>
cd apiCommerce2
```
2. Instalar dependencias:
```
npm install
```
3. Variables de entorno (archivo `.env` en la raíz). Variables recomendadas:
```
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=ecommerce
PORT=3000
JWT_SECRET=una_clave_secreta
JWT_EXPIRES_IN=1h
# SMTP (opcional, si no están configuradas se usa Ethereal para previews)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=
APP_URL=http://localhost:3000
```
4. Ejecutar app (dev):
```
npm run dev
```

**Descripción general**
- Framework: Express + Handlebars
- DB: MongoDB con Mongoose
- Auth: Passport (local + jwt). Login emite cookie `token` con JWT.
- Email: `nodemailer` con fallback a Ethereal para desarrollo

**Principales rutas (API)**

Nota: la mayoría de endpoints protegidos requieren autenticación (token JWT). Algunas rutas usan autorización por rol (`ensureRole`).

**Sessions** (`/api/sessions`)
- `POST /api/sessions/login` : Login. Body `{ email, password }`. Respuesta JSON con `token` y `user`. También setea cookie `token`.
- `GET /api/sessions/current` : Devuelve `{ user }` del token en cookie/Authorization header. (Protected)
- `POST /api/sessions/logout` : Limpia cookie `token`.
- `POST /api/sessions/forgot` : Solicitud de restablecimiento. Body `{ email }`. Respuesta `ok: true` siempre (no revela existencia).
- `GET /reset/:token` : Vista pública que renderiza formulario de restablecimiento (vía `views` routes). Token expira en 1 hora.
- `POST /api/sessions/reset/:token` : Envía nueva contraseña. Body `password`. Restricciones: no puede ser igual a la anterior. Borra token y expiry tras éxito.

**Users** (`/api/users`)
- `POST /api/users` : Crear usuario (public). Body: según `dtos/user.dto` (p. ej. `first_name`, `last_name`, `email`, `password`, `age`). Crea además un carrito vacío asociado.
- `GET /api/users` : Listar usuarios (protected con JWT).
- `GET /api/users/:id` : Obtener usuario por id (protected).
- `PUT /api/users/:id` : Actualizar usuario (protected).
- `DELETE /api/users/:id` : Eliminar usuario (protected).

**Products** (`/api/products`)
- `GET /api/products` : Listar productos (público).
- `GET /api/products/:id` : Detalle (público).
- `POST /api/products` : Crear producto (protegido, requiere `role: 'vendor'`).
- `PUT /api/products/:id` : Modificar producto (protegido, `vendor`).
- `DELETE /api/products/:id` : Eliminar producto (protegido, `vendor`).

**Carts** (`/api/carts`)
- Todas las rutas de `carts` están protegidas con JWT mediante `ensureAuth`.
- `GET /api/carts/me` : Obtener carrito del usuario logueado (populado).
- `POST /api/carts/:cid/product/:pid` : Añadir/incrementar producto en el carrito (solo `role: 'user'`).
- `PUT /api/carts/:cid/products/:pid` : Actualizar cantidad (protegido).
- `DELETE /api/carts/:cid/products/:pid` : Eliminar producto del carrito (protegido).
- `PUT /api/carts/:cid` : Reemplazar productos del carrito (protegido).
- `POST /api/carts/:cid/purchase` : Finalizar compra de un carrito (protegido). Nota: el servicio evita crear una orden si el `amount` es 0 o no hay items procesables.
- `DELETE /api/carts/:cid` : Limpiar carrito (protegido).

**Orders** (`/api/orders`)
- `GET /api/orders` : Listar órdenes del usuario autenticado (protegido).
- `GET /api/orders/:id` : Detalle de orden (protegido).

**Vistas (Handlebars)**
- `GET /` -> redirect `/panel` o `/login`
- `GET /login` -> login view
- `GET /register` -> register view
- `GET /forgot` -> view para solicitar restablecimiento
- `GET /reset/:token` -> view con formulario para nueva contraseña
- `GET /panel` -> panel del usuario (protegido)
- `GET /cart` -> vista carrito (protegido)
- `GET /checkout` -> checkout (protegido)
- `GET /orders` -> lista de órdenes (protegido)

**Seguridad y comportamiento importante**
- JWT: Se firma con `JWT_SECRET` y se envía como cookie `token`. Tiempo de expiración controlado por `JWT_EXPIRES_IN`.
- Recuperación de contraseña: el token se genera con `crypto.randomBytes(32).toString('hex')`, se guarda en `User.resetPasswordToken` y `resetPasswordExpires` (1 hora). La vista `GET /reset/:token` valida el token y muestra el formulario solo si el token está presente y no expiró.
- No se crean órdenes con monto `0` o sin items procesados: la lógica en `cart.service.purchaseCart` devuelve un error y no modifica el carrito.
- Control de roles: middleware `ensureRole(role)` disponible. Usado para restringir:
  - `ensureRole('user')` en la ruta para añadir productos al carrito.
  - `ensureRole('vendor')` en las rutas de crear/editar/eliminar productos.

**Mailer**
- `src/lib/mailer.js` usa `nodemailer` y, si no hay SMTP configurado, crea una cuenta Ethereal para preview. Revisa la consola para `Ethereal preview URL` cuando se usa fallback.

**Ejemplos rápidos (curl)**

- Login:
```
curl -X POST -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"secret"}' http://localhost:3000/api/sessions/login
```

- Solicitar restablecimiento:
```
curl -X POST -H "Content-Type: application/json" -d '{"email":"user@example.com"}' http://localhost:3000/api/sessions/forgot
```

- Finalizar compra (ejemplo):
```
curl -X POST -H "Content-Type: application/json" --cookie "token=<JWT_COOKIE>" http://localhost:3000/api/carts/<CART_ID>/purchase
```

