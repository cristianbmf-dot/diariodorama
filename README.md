# Diário de doramas (Netlify)

## Publicar (caminho mais fácil: GitHub + Netlify)
1. Crie um repositório no GitHub e envie todos os arquivos desta pasta, mantendo as pastas (`public/`, `netlify/functions/`, `netlify.toml`).
2. No Netlify: Add new site > Import an existing project > escolha o repositório. As configurações vêm do `netlify.toml`, é só confirmar.
3. No Netlify: Site configuration > Environment variables > Add a variable:
   - Key: `TMDB_API_KEY`
   - Value: sua chave "API Key" do TMDB (themoviedb.org > Configurações > API)
4. Em Deploys, clique em Trigger deploy > Deploy site (para a variável valer).
5. Teste: abra `https://SEU-SITE.netlify.app/api/tmdb?action=discover&page=1`. Deve aparecer uma lista em JSON. Depois abra o site.

## Alternativa pela linha de comando
    npm i -g netlify-cli
    netlify login
    netlify init
    netlify env:set TMDB_API_KEY SUA_CHAVE
    netlify deploy --prod

## Cuidados
- Nunca coloque a chave no código nem no GitHub. Ela só vai na variável de ambiente.
- Mantenha o logo e o aviso do TMDB na seção "Sobre e créditos".
- Uso comercial (anúncios, plano pago) exige licença do TMDB.
