"""
Datos de Estaciones Línea 1 - Metro de Santiago
Para poblar la base de datos del prototipo BikeMetro

Archivo: backend/api/data/estaciones_linea1.py
"""

# Estaciones completas de la Línea 1 del Metro de Santiago
# De San Pablo a Los Dominicos (23 estaciones)

ESTACIONES_LINEA1 = [
    {
        'nombre': 'San Pablo',
        'linea': 'L1',
        'orden': 1,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Neptuno',
        'linea': 'L1',
        'orden': 2,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Pajaritos',
        'linea': 'L1',
        'orden': 3,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Las Rejas',
        'linea': 'L1',
        'orden': 4,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': False,  # Para el prototipo, no todas tienen
    },
    {
        'nombre': 'Ecuador',
        'linea': 'L1',
        'orden': 5,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'San Alberto Hurtado',
        'linea': 'L1',
        'orden': 6,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': False,
    },
    {
        'nombre': 'Universidad de Santiago',
        'linea': 'L1',
        'orden': 7,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Estación Central',
        'linea': 'L1',
        'orden': 8,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Unión Latinoamericana',
        'linea': 'L1',
        'orden': 9,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': False,
    },
    {
        'nombre': 'República',
        'linea': 'L1',
        'orden': 10,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Los Héroes',
        'linea': 'L1',
        'orden': 11,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
        'es_combinacion': True,  # Combinación con L2
    },
    {
        'nombre': 'La Moneda',
        'linea': 'L1',
        'orden': 12,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Universidad de Chile',
        'linea': 'L1',
        'orden': 13,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
        'es_combinacion': True,  # Combinación con L3
    },
    {
        'nombre': 'Santa Lucía',
        'linea': 'L1',
        'orden': 14,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Universidad Católica',
        'linea': 'L1',
        'orden': 15,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Baquedano',
        'linea': 'L1',
        'orden': 16,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
        'es_combinacion': True,  # Combinación con L5
    },
    {
        'nombre': 'Salvador',
        'linea': 'L1',
        'orden': 17,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Manuel Montt',
        'linea': 'L1',
        'orden': 18,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Pedro de Valdivia',
        'linea': 'L1',
        'orden': 19,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Los Leones',
        'linea': 'L1',
        'orden': 20,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Tobalaba',
        'linea': 'L1',
        'orden': 21,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
        'es_combinacion': True,  # Combinación con L4
    },
    {
        'nombre': 'El Golf',
        'linea': 'L1',
        'orden': 22,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': False,
    },
    {
        'nombre': 'Alcántara',
        'linea': 'L1',
        'orden': 23,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': False,
    },
    {
        'nombre': 'Escuela Militar',
        'linea': 'L1',
        'orden': 24,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Manquehue',
        'linea': 'L1',
        'orden': 25,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': False,
    },
    {
        'nombre': 'Hernando de Magallanes',
        'linea': 'L1',
        'orden': 26,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
    {
        'nombre': 'Los Dominicos',
        'linea': 'L1',
        'orden': 27,
        'estado': 'ACTIVO',
        'espacios_totales': 42,
        'tiene_bicicletero': True,
    },
]

# Estaciones seleccionadas para el prototipo inicial (las más concurridas)
ESTACIONES_PROTOTIPO = [
    'San Pablo',
    'Universidad de Santiago',
    'Estación Central',
    'Los Héroes',
    'Universidad de Chile',
    'Santa Lucía',
    'Baquedano',
    'Salvador',
    'Pedro de Valdivia',
    'Tobalaba',
    'Los Dominicos',
]

def get_estaciones_prototipo():
    """Retorna solo las estaciones seleccionadas para el prototipo"""
    return [
        est for est in ESTACIONES_LINEA1 
        if est['nombre'] in ESTACIONES_PROTOTIPO and est['tiene_bicicletero']
    ]

def get_todas_estaciones_con_bicicletero():
    """Retorna todas las estaciones que tienen bicicletero"""
    return [est for est in ESTACIONES_LINEA1 if est['tiene_bicicletero']]