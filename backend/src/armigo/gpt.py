from google import genai
from google.genai import types

client = genai.Client(api_key="AIzaSyDPNr_C6cSrdTaSyLqG93qMr9o1kWA3Feg")

def enviar_frase(frase, max=1500):
    response = client.models.generate_content(
        config=types.GenerateContentConfig(
            max_output_tokens=1500,
            temperature=0.1
        ),
        model="gemini-2.0-flash", contents=frase
    )
    return response.text

def get_conclusion(string):
    # Obtenemos el string de archivo primeraInstancia.txt
    content = open("/armigo/backend/src/prompts/primeraInstancia.txt", "r").read()
    # Introducimos el string un caracter antes del final del archivo
    content = content + string + "'\n"
    # Enviamos el contenido a la IA
    response = enviar_frase(content)
    # Separamos el contenido de conclusión del resto
    conclusion = response.split("Conclusión:")[1]
    # Hacemos un split frase por frase y nos quedamos con la que más longitud tenga
    conclusion = max(conclusion.split("\n"), key=len)
    # Retornamos la conclusión
    print(conclusion)
    return conclusion

def get_conversacion_limpia(context, string):
    # Obtenemos el string de archivo primeraInstancia.txt
    content = open("/armigo/backend/src/prompts/segundaInstancia.txt", "r").read()
    # Introducimos el string un caracter antes del final del archivo
    content = "[Analisis frase previa]\n"+ context + "\n[Objetivo]\nEstablecer conversación cercana, respetuosa y efectiva con el usuario dado el analisis previo en una única linea.\n[Diálogo]\nUsuario: "+ string + "\nIA: "
    # Enviamos el contenido a la IA
    response = enviar_frase(content, max=100)

    # Hacemos un split desde el principio hasta el final el primer Usuario: que aparezca
    conversacion = response.split("\n")[0]
    # Retornamos la conversación
    print(conversacion)
    sobreescribir_archivo(content+conversacion)
    return conversacion, content+conversacion

def sobreescribir_archivo(string):
    with open("/armigo/backend/src/prompts/segundaInstancia.txt", "w") as f:
        f.write(string)

def get_conversacion(string):
    content = open("/armigo/backend/src/prompts/segundaInstancia.txt", "r").read()
    content = content + "\nUsuario: "+ string + "\nAI: "
    response = enviar_frase(content, max=100)
    # Hacemos un split desde ultimo AI: que aparezca hasta el salto de línea
    conversacion = response.split("AI: ")[-1].split("\n")[0]
    print(conversacion)
    sobreescribir_archivo(content+conversacion)
    return conversacion, content+conversacion


if __name__ == '__main__':
    frase = input("Frase a evaluar: ")
    conclusion = get_conclusion(frase)
    conversacion = get_conversacion_limpia(conclusion, frase)
    while True:
        frase = input("Frase a evaluar: ")
        get_conversacion(frase)

