import unittest
# Lógica de la funcionalidad
def calcular_suma(a, b):
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("Ambos argumentos deben ser números (int o float).")
    return a + b

# Pruebas unitarias
class TestEjercicioSuma(unittest.TestCase):

    def test_suma_exitosa(self):
        """Caso Exitoso: Suma de enteros y negativos"""
        self.assertEqual(calcular_suma(14, 6), 20)
        self.assertEqual(calcular_suma(-5, -5), -10)
        self.assertEqual(calcular_suma(0, 8.5), 8.5)

    def test_suma_invalida(self):
        """Caso Fallido: Tipos incompatibles deben lanzar TypeError"""
        with self.assertRaises(TypeError):
            calcular_suma("10", 5)

if __name__ == "__main__":
    unittest.main(verbosity=2)
