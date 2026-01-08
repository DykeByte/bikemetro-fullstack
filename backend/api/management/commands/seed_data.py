"""
Comando Django para poblar la base de datos con datos iniciales
Archivo: backend/api/management/commands/seed_data.py

Uso: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import Usuario, Estacion, EspacioEstacionamiento
from api.data.estaciones_linea1 import get_estaciones_prototipo

class Command(BaseCommand):
    help = 'Poblar base de datos con datos iniciales del prototipo BikeMetro'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Poblar con todas las estaciones de Línea 1 (no solo prototipo)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Limpiar datos existentes antes de poblar',
        )
    
    @transaction.atomic
    def handle(self, *args, **options):
        
        # Limpiar datos si se especifica
        if options['clear']:
            self.stdout.write(self.style.WARNING('Limpiando datos existentes...'))
            EspacioEstacionamiento.objects.all().delete()
            Estacion.objects.all().delete()
            # No eliminamos usuarios para preservar cuentas de prueba
            self.stdout.write(self.style.SUCCESS('✓ Datos limpiados'))
        
        # Obtener estaciones a crear
        estaciones_data = get_estaciones_prototipo()
        
        if options['all']:
            from api.data.estaciones_linea1 import get_todas_estaciones_con_bicicletero
            estaciones_data = get_todas_estaciones_con_bicicletero()
            self.stdout.write(
                self.style.WARNING('Modo ALL: Creando todas las estaciones con bicicletero')
            )
        
        # Crear estaciones y sus espacios
        estaciones_creadas = 0
        espacios_creados = 0
        
        for data in estaciones_data:
            # Crear o actualizar estación
            estacion, created = Estacion.objects.update_or_create(
                nombre=data['nombre'],
                defaults={
                    'linea': data['linea'],
                    'estado': data['estado'],
                    'espacios_totales': data['espacios_totales'],
                }
            )
            
            if created:
                estaciones_creadas += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Estación creada: {estacion.nombre}')
                )
                
                # Crear espacios para esta estación (matriz 7x3)
                for fila in range(1, 8):  # Filas 1-7
                    for columna in ['A', 'B', 'C']:  # Columnas A, B, C
                        espacio, _ = EspacioEstacionamiento.objects.get_or_create(
                            estacion=estacion,
                            fila=fila,
                            columna=columna,
                            defaults={'estado': 'DISPONIBLE'}
                        )
                        espacios_creados += 1
                
                self.stdout.write(f'  → 21 espacios creados para {estacion.nombre}')
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠ Estación ya existe: {estacion.nombre}')
                )
        
        # Resumen
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('RESUMEN:'))
        self.stdout.write(f'  • Estaciones creadas: {estaciones_creadas}')
        self.stdout.write(f'  • Espacios creados: {espacios_creados}')
        self.stdout.write(f'  • Total estaciones en BD: {Estacion.objects.count()}')
        self.stdout.write(f'  • Total espacios en BD: {EspacioEstacionamiento.objects.count()}')
        self.stdout.write('='*60 + '\n')
        
        # Crear usuarios de prueba si no existen
        self.crear_usuarios_prueba()
    
    def crear_usuarios_prueba(self):
        """Crear usuarios de prueba para testing"""
        self.stdout.write(self.style.WARNING('\nCreando usuarios de prueba...'))
        
        usuarios_prueba = [
            {
                'username': 'catalina',
                'email': 'catalina@bikemetro.cl',
                'password': 'test123',
                'first_name': 'Catalina',
                'last_name': 'Marín',
                'rut': '19034677-3',
                'telefono': '+56951334499',
                'numero_tarjeta_bip': '1234',
            },
            {
                'username': 'testuser',
                'email': 'test@bikemetro.cl',
                'password': 'test123',
                'first_name': 'Usuario',
                'last_name': 'Prueba',
                'rut': '12345678-9',
                'telefono': '+56912345678',
                'numero_tarjeta_bip': '5678',
            },
        ]
        
        for user_data in usuarios_prueba:
            username = user_data['username']
            password = user_data.pop('password')
            rut = user_data['rut']
            
            # Verificar si el usuario ya existe por username o RUT
            if Usuario.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.WARNING(f'⚠ Usuario ya existe: {username}')
                )
                continue
            
            if Usuario.objects.filter(rut=rut).exists():
                self.stdout.write(
                    self.style.WARNING(f'⚠ Usuario con RUT {rut} ya existe')
                )
                continue
            
            # Crear usuario
            try:
                user = Usuario.objects.create_user(
                    password=password,
                    **user_data
                )
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Usuario creado: {username}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Error al crear {username}: {str(e)}')
                )
        
        self.stdout.write('\n' + self.style.SUCCESS('¡Base de datos poblada exitosamente!'))