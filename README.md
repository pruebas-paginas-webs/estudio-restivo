# Estudio Restivo

Sitio web del **Estudio Restivo** — abogados. Asesoramiento integral en transacciones
comerciales complejas, a nivel nacional e internacional. Desde 1995.

Sitio estático: **HTML + CSS + JavaScript** (sin frameworks ni build).

## Ver en local
- **Opción simple:** doble clic en `index.html` (abre directo en el navegador).
- **Con servidor:** `python -m http.server 8000` o `npx serve`, y abrir la URL que indique.

## Estructura
```
index.html        Página principal (one-page)
css/styles.css    Estilos
js/main.js        Interacciones (nav, reveals, formulario)
assets/           Imágenes (logo, fotos de la oficina, logos de clientes)
```

## Formulario de contacto
El formulario usa [Web3Forms](https://web3forms.com) (sin backend). Para activarlo,
reemplazá `YOUR_WEB3FORMS_ACCESS_KEY` en `index.html` por tu Access Key gratuita.
