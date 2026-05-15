import urllib.request
import ssl

url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1MWJiNjY5Mjc0NDAwOTI1ZDViMGQ2MmE4M2YzEgsSBxCl0quzmR4YAZIBIwoKcHJvamVjdF9pZBIVQhM4NDI4OTgzMzg2NTgwODE2MjIx&filename=&opi=89354086"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    with urllib.request.urlopen(url, context=ctx) as response:
        html = response.read().decode('utf-8')
    with open('chat_screen.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Download successful")
except Exception as e:
    print(f"Error: {e}")
