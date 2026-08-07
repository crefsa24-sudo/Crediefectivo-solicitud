# CrediEfectivo - Solicitud de Crédito

Formulario web de solicitud de crédito personal. Permite capturar los datos del cliente y del aval en una sola página, calcula automáticamente la capacidad de pago semanal, genera un PDF con el resumen de la solicitud y lo envía por WhatsApp.

## Estructura del proyecto

```
├── index.html    # Estructura del formulario (HTML)
├── style.css     # Estilos visuales (CSS)
├── script.js     # Lógica: cálculos, validación, generación de PDF y envío a WhatsApp
└── README.md     # Este archivo
```

## Cómo funciona

1. El titular y el aval llenan sus datos en la misma página (identificación, domicilio, ingresos y gastos mensuales).
2. El formulario calcula en tiempo real el total de ingresos, gastos y la **capacidad de pago semanal** (diferencia entre ingresos y gastos, dividida entre 4).
3. Al enviar, se genera un PDF con todos los datos (usando [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)) que se descarga automáticamente.
4. Se abre WhatsApp con un resumen de la solicitud listo para enviar; el usuario adjunta el PDF descargado manualmente en el chat.

## Uso local

Solo abre `index.html` en cualquier navegador. No requiere servidor ni instalación — es HTML/CSS/JS puro, sin dependencias de backend.

## Publicación en GitHub Pages

Este proyecto está listo para GitHub Pages: al activar Pages sobre la rama `main`, `index.html` se sirve automáticamente como página principal.

## Dependencias externas (vía CDN)

- [Font Awesome 6.4.0](https://cdnjs.com/libraries/font-awesome) — iconos
- [SweetAlert2](https://sweetalert2.github.io/) — alertas y modales
- [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) — generación de PDF

## Nota de seguridad

Los datos capturados (ingresos, domicilios, teléfonos) se envían en texto plano por WhatsApp, ya que el formulario no tiene backend propio. Para uso en producción con datos sensibles de clientes reales, se recomienda agregar un backend que reciba y almacene la información de forma segura, en lugar de depender únicamente de WhatsApp como canal de envío.

## Licencia

Uso interno de CrediEfectivo.
