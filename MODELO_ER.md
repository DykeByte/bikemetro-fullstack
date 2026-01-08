# 📊 MODELO ENTIDAD-RELACIÓN - BikeMetro

## Diagrama Conceptual

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA BIKEMETRO                            │
│                    Modelo de Base de Datos                       │
└─────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━┓
┃     USUARIO       ┃
┣━━━━━━━━━━━━━━━━━━━┫
┃ 🔑 id             ┃
┃ 📧 email          ┃ (único)
┃ 👤 nickname       ┃ (único, username)
┃ 📝 nombre         ┃ (first_name)
┃ 🆔 rut            ┃ (único, formato: 12345678-9)
┃ 📱 telefono       ┃
┃ 🎫 numero_tarjeta_┃
┃    bip            ┃
┃ ✓ email_verificado┃
┃ ✓ telefono_       ┃
┃    verificado     ┃
┃ 🔒 password       ┃ (hasheado)
┗━━━━━━━━━━━━━━━━━━━┛
         │
         │ 1
         │
         │ crea/tiene
         │
         │ N
         ▼
┏━━━━━━━━━━━━━━━━━━━┓
┃     RESERVA       ┃
┣━━━━━━━━━━━━━━━━━━━┫
┃ 🔑 id (UUID)      ┃
┃ 🔗 usuario_id     ┃ (FK)
┃ 🔗 estacion_id    ┃ (FK)
┃ 🔗 espacio_id     ┃ (FK)
┃ 📊 estado         ┃ (PENDIENTE/CONFIRMADA/EN_CURSO/
┃                   ┃  FINALIZADA/CANCELADA/EXPIRADA)
┃ 📅 fecha_reserva  ┃
┃ ⏰ fecha_expiracion┃ (+10 min)
┃ 🚪 fecha_entrada  ┃
┃ 🚪 fecha_salida   ┃
┃ 📱 qr_entrada     ┃ (UUID)
┃ 📱 qr_salida      ┃ (UUID)
┃ 💰 costo_total    ┃
┃ ✓ pagado          ┃
┗━━━━━━━━━━━━━━━━━━━┛
    │         │
    │ 1       │ N
    │         │
    │         └─────────────┐
    │                       │
    │ N                     │ 1
    ▼                       ▼
┏━━━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━━━┓
┃    ESTACION       ┃  ┃ ESPACIO_          ┃
┣━━━━━━━━━━━━━━━━━━━┫  ┃ ESTACIONAMIENTO   ┃
┃ 🔑 id             ┃  ┣━━━━━━━━━━━━━━━━━━━┫
┃ 🏢 nombre         ┃◄─┃ 🔑 id             ┃
┃ 🚇 linea          ┃1 ┃ 🔗 estacion_id    ┃ (FK)
┃    (L1...L7)      ┃  ┃ 🔢 fila           ┃ (1-7)
┃ 📊 estado         ┃N ┃ 🔠 columna        ┃ (A,B,C)
┃    (ACTIVO/       ┃  ┃ 📊 estado         ┃ (DISPONIBLE/
┃     INACTIVO)     ┃  ┃                   ┃  OCUPADO/
┃ 🎯 espacios_      ┃  ┃                   ┃  RESERVADO/
┃    totales        ┃  ┃                   ┃  MANTENIMIENTO)
┃ ➕ espacios_      ┃  ┃ 📝 codigo         ┃ (computed: A1,B3,C7)
┃    disponibles    ┃  ┗━━━━━━━━━━━━━━━━━━━┛
┃    (calculado)    ┃           │
┗━━━━━━━━━━━━━━━━━━━┛           │
                                │ 1
                                │
                                │ tiene
                                │
                                │ N
                                ▼
                          [Espacios de
                           estacionamiento]
                              Matrix:
                           7 filas × 3 columnas
                                = 21 espacios
                              por estación


┏━━━━━━━━━━━━━━━━━━━┓
┃      PAGO         ┃
┣━━━━━━━━━━━━━━━━━━━┫     Relaciones adicionales
┃ 🔑 id             ┃     (no mostradas en diagrama
┃ 🔗 reserva_id     ┃     para mantener claridad):
┃ 💰 monto          ┃
┃ 💳 metodo_pago    ┃     • RESEÑA (Usuario → Estación)
┃ 📊 estado         ┃     • NOTIFICACION (Usuario ← Sistema)
┃ 🧾 numero_recibo  ┃     • TICKET_SOPORTE (Usuario → Soporte)
┗━━━━━━━━━━━━━━━━━━━┛
         △
         │ 1:1
         │
    RESERVA
```

## 🔑 Campos Principales por Entidad

### 👤 USUARIO (Registro y Login)

**Campos para registro:**

- `nickname` (username) - Obligatorio, único
- `nombre` (first_name) - Obligatorio
- `email` - Obligatorio, único
- `rut` - Obligatorio, único, formato: 12345678-9
- `telefono` - Obligatorio
- `password` - Obligatorio, min 8 caracteres

**Campos para login:**
Usuario puede ingresar con:

- `email` O
- `rut` O
- `nickname`

* `password`

**Perfil de usuario (datos visibles en app):**

- `rut` (solo lectura)
- `email`
- `numero_tarjeta_bip`
- `telefono`

---

### 🏢 ESTACION

**Campos:**

- `nombre` - Único (ej: "Universidad de Chile")
- `linea` - Choices: L1, L2, L3, L4, L4A, L5, L6, L7
- `estado` - ACTIVO / INACTIVO
- `espacios_totales` - Integer (default: 42)
- `espacios_disponibles` - Calculado en tiempo real

**Nota:** Para prototipo inicial solo se usa **Línea 1**

---

### 🅿️ ESPACIO_ESTACIONAMIENTO

**Campos:**

- `estacion` - FK a Estacion
- `fila` - Integer (1-7)
- `columna` - Char (A, B, C)
- `estado` - DISPONIBLE / OCUPADO / RESERVADO / MANTENIMIENTO
- `codigo` - Computed property (ej: "A1", "B7", "C3")

**Matriz de espacios:**

```
     A    B    C
1   [·]  [·]  [·]
2   [·]  [·]  [·]
3   [·]  [·]  [·]
4   [·]  [·]  [·]
5   [·]  [·]  [·]
6   [·]  [·]  [·]
7   [·]  [·]  [·]

Total: 21 espacios por estación
```

---

## 🔗 Relaciones

### Usuario → Reserva (1:N)

- Un usuario puede tener múltiples reservas
- Una reserva pertenece a un solo usuario

### Estacion → Espacio (1:N)

- Una estación tiene múltiples espacios
- Un espacio pertenece a una sola estación

### Reserva → Estacion (N:1)

- Múltiples reservas pueden ser para una estación
- Una reserva es para una sola estación

### Reserva → Espacio (N:1)

- Múltiples reservas pueden usar un espacio (en diferentes momentos)
- Una reserva ocupa un solo espacio

### Reserva → Pago (1:1)

- Una reserva tiene un pago asociado
- Un pago corresponde a una sola reserva

---

## 📋 Estados y Flujos

### Estados de RESERVA:

```
PENDIENTE ──────► CONFIRMADA ──────► EN_CURSO ──────► FINALIZADA
    │                                                      △
    │                                                      │
    └──────► CANCELADA                                    │
    │                                                      │
    └──────► EXPIRADA (timeout 10 min)                   │
                                                           │
                                           [Pago realizado]
```

### Estados de ESPACIO:

```
DISPONIBLE ◄──────┐
    │              │
    ▼              │
RESERVADO          │
    │              │
    ▼              │
OCUPADO ───────────┘
    │
    ▼
MANTENIMIENTO
```

### Estados de ESTACION:

```
ACTIVO ◄──► INACTIVO
```

---

## 🎯 Reglas de Negocio

1. **Reserva:**

   - Duración máxima: 10 minutos (se libera automáticamente)
   - Usuario puede tener solo 1 reserva activa a la vez
   - Requiere QR único para entrada y salida

2. **Espacios:**

   - 21 espacios por estación (7 filas × 3 columnas)
   - Identificación: Columna + Fila (A1, B3, C7, etc.)
   - Estado se actualiza en tiempo real

3. **Tarifas:**

   - 2 horas gratis con pasaje de metro
   - $500 por cada media hora adicional
   - Cobro al retirar bicicleta

4. **Login múltiple:**
   - Usuario puede ingresar con: email, RUT o nickname
   - Todos son únicos en el sistema

---

## 📊 Índices de Base de Datos (Performance)

```sql
-- USUARIO
INDEX idx_usuario_rut ON usuario(rut);
INDEX idx_usuario_email ON usuario(email);
INDEX idx_usuario_username ON usuario(username);

-- ESTACION
INDEX idx_estacion_linea_estado ON estacion(linea, estado);

-- ESPACIO
INDEX idx_espacio_estacion_estado ON espacio_estacionamiento(estacion_id, estado);

-- RESERVA
INDEX idx_reserva_usuario_estado ON reserva(usuario_id, estado);
INDEX idx_reserva_estacion_estado ON reserva(estacion_id, estado);
INDEX idx_reserva_qr_entrada ON reserva(qr_entrada);
INDEX idx_reserva_qr_salida ON reserva(qr_salida);
```

---

## 🔐 Constraints (Integridad de Datos)

```sql
-- Unique constraints
UNIQUE (usuario.email)
UNIQUE (usuario.rut)
UNIQUE (usuario.username)
UNIQUE (estacion.nombre)
UNIQUE (espacio_estacionamiento.estacion_id, fila, columna)

-- Check constraints
CHECK (espacio_estacionamiento.fila BETWEEN 1 AND 7)
CHECK (espacio_estacionamiento.columna IN ('A', 'B', 'C'))
CHECK (resena.calificacion BETWEEN 1 AND 5)
```

---

## 📝 Notas de Implementación

1. **UUID para QR:** Se usan UUIDs para códigos QR por seguridad
2. **Soft Delete:** Considerar implementar para reservas y usuarios
3. **Auditoría:** Todos los modelos tienen `created_at` y `updated_at`
4. **Validación RUT:** Implementada a nivel de modelo y serializer
5. **Cálculos en tiempo real:** `espacios_disponibles` es una property

---

Este modelo está optimizado para:
✅ Prototipo con Línea 1
✅ Escalabilidad a otras líneas
✅ Performance en consultas frecuentes
✅ Integridad de datos
✅ Seguridad en autenticación

admin
pass: adminmetro123!
name: Catalina
