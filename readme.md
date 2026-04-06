# ToyoXpress API v1 - Core Backend & ERP (Legacy)

### **API RESTful Empresarial con Procesamiento Documental y Notificaciones SSE**

Este repositorio contiene la primera iteración del backend para **ToyoXpress**, un sistema integral de gestión de inventarios y punto de venta. Construido bajo una arquitectura **MVC** con **Node.js, Express y MongoDB**, esta API sirvió como el núcleo operativo inicial antes de la evolución del sistema hacia una arquitectura orientada a eventos en AWS (v2).

*(Nota: Aunque es un proyecto Legacy, incluye patrones avanzados de diseño backend que validan mi experiencia en la construcción de software corporativo).*

---

## 🚀 Retos de Ingeniería y Soluciones Aplicadas

El desarrollo de este motor transaccional requirió ir más allá de los clásicos endpoints CRUD, implementando soluciones técnicas para cuellos de botella operativos:

* **Eventos Unidireccionales en Tiempo Real (SSE):** En lugar de sobrecargar el servidor con conexiones bidireccionales completas (WebSockets), implementé un gestor centralizado de **Server-Sent Events (`sseManager.js`)**. Esto permitió enviar flujos continuos de alertas (ej. bajo stock, nuevos pedidos) desde el servidor a múltiples clientes POS de forma extremadamente ligera y eficiente.
* **Motor de Renderizado Documental (Server-Side PDF):** Integración de `pdfkit` (`dataPDF.js`) para la generación dinámica, compilación y almacenamiento (`uploads/`) de facturas, cotizaciones y comprobantes de inventario directamente en el servidor, asegurando un formato inalterable y liberando de carga computacional a los clientes de bajos recursos.
* **Ingesta Masiva y ETL (Extract, Transform, Load):** Implementación de controladores especializados (`excel.js`) que utilizan la librería `xlsx` para procesar catálogos enteros subidos por el usuario (vía `multer`), sanitizando la data antes de realizar inserciones en lote (*bulk inserts*) en la base de datos no relacional.
* **Control de Acceso Operativo (Middlewares):** Desarrollo de interceptores de seguridad complejos como `checkTime.js` y `checkH.js`. Estos *middlewares* bloquean transacciones físicas de los cajeros si se intentan realizar fuera del horario comercial configurado, traduciendo requerimientos administrativos estrictos a código puro.

---

## 🛠️ Stack Tecnológico (v1)

* **Entorno & Framework:** Node.js, Express.js.
* **Base de Datos:** MongoDB, modelado fuertemente tipado a través de esquemas de **Mongoose** (`user.js`, `movimiento.js`, `pedido.js`).
* **Seguridad & Sesiones:** `jsonwebtoken` (JWT) para la firma de sesiones y `bcrypt` para el *hashing* de credenciales.
* **Integraciones y Utilidades:** * `nodemailer`: Para notificaciones transaccionales vía email.
  * `multer`: Para la gestión de *multipart/form-data* y subida de archivos seguros.
* **Despliegue:** Configuración orientada a funciones Serverless mediante `vercel.json`.

---

## 📦 Características Principales

* **Sincronización B2B (WooCommerce):** Controlador dedicado (`woocommerce.js`) para establecer puentes de comunicación con tiendas virtuales, gestionando la dualidad de stock físico/digital.
* **Trazabilidad Absoluta:** Sistema de `movimiento-verificado.js` que actúa como un libro mayor (*ledger*), donde cada cambio en el inventario requiere la firma JWT del operador, evitando alteraciones fantasma.
* **Gestión de Correlativos:** Algoritmos dedicados (`getNextCorrelativo.js`) para mantener la integridad de la numeración legal en la emisión de comprobantes de pago simultáneos.

---

## ⚙️ Configuración Local

### Requisitos Previos
* Node.js (14+)
* MongoDB local o cluster en Atlas.

### Instalación

1. Clonar el repositorio:
```bash
git clone [https://github.com/mdemedina/backend-toyoexpress.git](https://github.com/mdemedina/backend-toyoexpress.git)
cd backend-toyoexpress
```

2. Instalar dependencias:
```bash
npm install
```

3. Variables de Entorno (`.env`):
```env
PORT=3000
DB_URI=mongodb+srv://tu-usuario:tu-password@cluster.mongodb.net/toyoexpress
JWT_SECRET=tu_secreto_jwt
EMAIL_USER=soporte@toyoexpress.com
EMAIL_PASS=password_de_aplicacion
```

4. Ejecutar el servidor (Modo Desarrollo):
```bash
npm run dev
```

---

## 🏗️ Topología del Proyecto (MVC)

```text
/
├── app/
│   ├── controllers/      # Lógica de negocio HTTP (orders, products, excel)
│   ├── helpers/          # Utilidades (handleError, parseo de fechas)
│   ├── img/              # Assets estáticos para inyección en PDFs
│   ├── middleware/       # Capa de seguridad (Auth, Role, Time Validation)
│   ├── models/           # Definición de Schemas (Mongoose)
│   ├── routes/           # Mapeo de Endpoints RESTful
│   └── utils/            # Funciones puras (pdfGenerator, nextCorrelativo)
├── config/               # Conexiones (MongoDB, SMTP)
├── sseManager.js         # Singleton para la gestión de Server-Sent Events
├── index.js              # Punto de entrada de la aplicación Express
└── vercel.json           # Configuración de Serverless Functions
```
