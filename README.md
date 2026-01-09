# BikeMetro

BikeMetro es una plataforma integral diseñada para facilitar la movilidad urbana intermodal, permitiendo a los usuarios planificar rutas y gestionar la logística entre el uso de la bicicleta y el sistema de transporte Metro.

Este repositorio contiene una solución Fullstack moderna, escalable y de alto rendimiento.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
* Next.js: Framework de React para renderizado híbrido y rutas optimizadas.
* Tailwind CSS: Framework de utilidades para un diseño moderno y responsivo.
* TypeScript: Tipado estático para un desarrollo más robusto.

### Backend
* FastAPI: Framework de Python de alto rendimiento para la construcción de APIs.
* SQLAlchemy / SQLModel: ORM para la interacción eficiente con la base de datos.
* PostgreSQL: Sistema de gestión de bases de datos relacionales.

---

## 🚀 Instalación y Ejecución

Sigue estos pasos para levantar el entorno de desarrollo:

### 1. Clonar el Proyecto
git clone https://github.com/DykeByte/bikemetro-fullstack.git
cd bikemetro-fullstack

### 2. Configurar el Backend
cd backend
# Crear entorno virtual
python -m venv venv
# Activar entorno (Windows)
.\venv\Scripts\activate
# Activar entorno (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

### 3. Configurar el Frontend
cd ../frontend
# Instalar dependencias
npm install

---

## 📂 Estructura del Repositorio

* /frontend: Interfaz de usuario, componentes y lógica de cliente.
* /backend: Endpoints de la API, modelos de datos y lógica de negocio.
* /database: Scripts de inicialización y esquemas.

---

## 🗺️ Roadmap / Próximas Funcionalidades
- [ ] Integración de mapas en tiempo real (Leaflet/Mapbox).
- [ ] Dockerización completa del entorno.
- [ ] Integración de sistema de pagos.

---

## 📄 Licencia
Distribuido bajo la Licencia MIT.

---
Desarrollado por DykeByte (https://github.com/DykeByte)
