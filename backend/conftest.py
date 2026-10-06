import sys
import os

# Ajoute le dossier backend/ (celui qui contient ce fichier) à la liste des
# endroits où Python cherche les modules, pour pouvoir écrire
# `from rag.text_splitter import ...` dans les tests, peu importe d'où
# pytest est lancé.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
