# Princessware — sitio multipágina

Sitio estático funcional (HTML + CSS + JS, sin frameworks) construido a partir del diseño original de Claude Design.
Pensado para dos usos: **publicarlo ya mismo** como tu landing/catálogo, y servir de **plano visual exacto** para el tema de WooCommerce.

## Qué incluye

| Página | Archivo | Qué hace |
|---|---|---|
| Home | `index.html` | Hero, beneficios, categorías, más vendidos con filtros, oferta con countdown |
| Tienda / catálogo | `tienda.html` | Grilla con filtros por categoría, ofertas, orden por precio/rating. Soporta `?cat=sets` |
| Ficha de producto | `producto.html?id=p1` | Galería, cantidad, agregar al carrito, especificaciones, relacionados |
| El Acero 18/8 | `acero-18-8.html` | Explicación del material + cuidados + garantía |
| Nosotros | `nosotros.html` | Historia, bloques destacados, banda de stats |
| Recetas | `recetas.html` | Grilla de recetas |
| Contacto | `contacto.html` | Formulario que arma un mensaje y abre WhatsApp |

**Funcionalidad ya implementada:** carrito persistente (se guarda en el navegador), drawer lateral, barra de "envío gratis", favoritos, contador de oferta, filtros y orden, galería de producto, y **checkout que arma el pedido y lo manda por WhatsApp** (tu camino intermedio).

## 1. Configurá tus datos

Abrí `js/data.js` y editá el bloque `SETTINGS`:

```js
const SETTINGS = {
  whatsapp: '5491100000000',   // tu número real, formato internacional sin "+" (ej: 54 9 11 ...)
  instagram: 'princessware.oficial',
  freeShip: 800000,            // umbral de envío gratis
};
```

Los productos, precios y fotos también están en `js/data.js` (arrays `PRODUCTS` y `CATEGORIES`). Cambialos ahí.

## 2. Probarlo en tu compu

No alcanza con abrir el `.html` directo (los navegadores bloquean cargar los `.js` por `file://`). Levantá un servidor local:

```bash
# dentro de la carpeta del sitio
python3 -m http.server 8000
# y abrí http://localhost:8000
```

## 3. Publicarlo online (rápido y gratis para empezar)

Es un sitio estático, así que se sube tal cual a cualquiera de estos (gratis para arrancar):

- **Netlify** o **Vercel:** arrastrás la carpeta y queda online en minutos. Después conectás tu dominio.
- **Cloudflare Pages** / **GitHub Pages:** igual de simple si usás Git.

Esto te deja vendiendo por WhatsApp ya mismo, mientras armás el checkout con pagos automáticos.

## 4. El paso a WooCommerce + Mercado Pago (cobros automáticos)

Cuando quieras cobros con tarjeta y las 12 cuotas dentro del sitio:

1. Contratá un **hosting con WordPress** (en Argentina hay varios con soporte local).
2. Instalá **WordPress** + el plugin **WooCommerce**.
3. Instalá el plugin oficial **"Mercado Pago payments for WooCommerce"** → te da checkout en pesos y cuotas.
4. Cargá tus productos (los mismos de `js/data.js`) en WooCommerce.
5. Para que se vea como este diseño: usá este sitio como **referencia visual exacta**. Las opciones, de menos a más trabajo:
   - Un tema base + un page builder (ej. Elementor) replicando colores y tipografías de `css/styles.css`.
   - Un **tema hijo** a medida: el HTML/CSS de estas páginas se traslada casi directo a las plantillas de WooCommerce (`header.php`, `footer.php`, `single-product.php`, `archive-product.php`).
   - Los tokens de marca ya están listos para copiar en las variables `:root` de `css/styles.css` (paleta navy, gradiente "metal", fuentes Cinzel / Cormorant / Montserrat).

> Nota importante: el carrito y el checkout de este sitio son una demo que deriva a WhatsApp. **El cobro real con tarjeta lo maneja Mercado Pago dentro de WooCommerce** — esa parte, junto con datos de pago y dominio, la configurás vos en tu cuenta (no debe hacerse desde acá por seguridad).

## 5. Formulario de contacto por email (opcional)

Hoy el formulario abre WhatsApp. Si querés recibir los mensajes por email sin backend, conectá un servicio tipo **Formspree** o **Web3Forms**: reemplazás el `onclick` del botón en `contacto.html` por un `fetch` al endpoint que te dan. En WooCommerce/WordPress, un plugin como Contact Form 7 lo resuelve.

## Estructura

```
princessware-site/
├── index.html  tienda.html  producto.html
├── nosotros.html  acero-18-8.html  recetas.html  contacto.html
├── css/styles.css        ← sistema de diseño (tokens + componentes + páginas)
├── js/
│   ├── data.js           ← catálogo y configuración (EDITAR ACÁ)
│   ├── store.js          ← carrito con persistencia
│   ├── components.js     ← header, footer, carrito, toast, nav móvil, WhatsApp
│   ├── home.js  shop.js  product.js
└── assets/               ← imágenes de marca
```
