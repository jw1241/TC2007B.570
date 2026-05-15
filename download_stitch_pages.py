import urllib.request
import os

PAGES = {
    "Iniciar_Sesion.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzA5ZTYwNmY0NWVkYzRlNmY5NWUxMjhlYzU2NDgxN2NlEgsSBxCl0quzmR4YAZIBIwoKcHJvamVjdF9pZBIVQhM4NDI4OTgzMzg2NTgwODE2MjIx&filename=&opi=89354086",
    "Mensajes_Lista_de_Profesores.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1MWJiNjY5Mjc0NDAwOTI1ZDViMGQ2MmE4M2YzEgsSBxCl0quzmR4YAZIBIwoKcHJvamVjdF9pZBIVQhM4NDI4OTgzMzg2NTgwODE2MjIx&filename=&opi=89354086",
    "Inicio_Resumen.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzI4NGRlYTA3NzYyZTQ1NWZhZTgyNTcwOTFkN2YxMTJmEgsSBxCl0quzmR4YAZIBIwoKcHJvamVjdF9pZBIVQhM4NDI4OTgzMzg2NTgwODE2MjIx&filename=&opi=89354086",
    "Inicio_Resumen_del_Alumno.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1MWJiNjIzYmVkZDUwNDMxMWE5ZDJjMDAyMjJhEgsSBxCl0quzmR4YAZIBIwoKcHJvamVjdF9pZBIVQhM4NDI4OTgzMzg2NTgwODE2MjIx&filename=&opi=89354086",
    "Boleta_de_Calificaciones.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzdjNzU1YzhkNGE0ZTRkYmM4NjM4Mzg2M2NkZGQyMzk4EgsSBxCl0quzmR4YAZIBIwoKcHJvamVjdF9pZBIVQhM4NDI4OTgzMzg2NTgwODE2MjIx&filename=&opi=89354086",
    "Mensajes_Profesores.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzE5ODg5YzgyZWQ1NjRmNjc5MTc3MmFhYzNhOGIyMDBiEgsSBxCl0quzmR4YAZIBIwoKcHJvamVjdF9pZBIVQhM4NDI4OTgzMzg2NTgwODE2MjIx&filename=&opi=89354086",
    "Seleccionar_Alumno.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzA4MzQ4YjYxZWI2MzQ0YTdiZmRiMjBmZjNlNDU2ZGRhEgsSBxCl0quzmR4YAZIBIwoKcHJvamVjdF9pZBIVQhM4NDI4OTgzMzg2NTgwODE2MjIx&filename=&opi=89354086"
}

def main():
    os.makedirs("stitch_pages", exist_ok=True)
    print("Iniciando descarga de pantallas desde Stitch...")
    for filename, url in PAGES.items():
        filepath = os.path.join("stitch_pages", filename)
        print(f"Descargando {filename}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                content = response.read()
                with open(filepath, 'wb') as f:
                    f.write(content)
            print(f"  -> Listo: {filepath}")
        except Exception as e:
            print(f"  -> Error descargando {filename}: {e}")
            
    print("\n¡Descarga completada! Puedes revisar la carpeta 'stitch_pages'.")

if __name__ == "__main__":
    main()
