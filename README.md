
# MongoDB Workflow no GitHub Actions

![alt text](image.png)

Este repositório contém um fluxo de trabalho no **GitHub Actions** que instala e utiliza o **MongoDB Shell (mongosh)** em ambiente Linux para execução de operações automatizadas com MongoDB.

🔧 Pré-requisitos

Antes de rodar o workflow, configure as seguintes **variáveis de repositório** no GitHub:

---

## 📂 Estrutura

- `.github/workflows/mongodb.yml` → Arquivo principal do workflow.  
- Variáveis sensíveis devem ser definidas em **Settings > Secrets and variables > Actions** no GitHub.  
- `AZURE_TOKEN` → Token de autenticação para acessar recursos no Azure.  
- `MONGO_URI` → String de conexão com o banco de dados MongoDB.  

---

## 🚀 Fluxo do Workflow

O workflow realiza os seguintes passos:

1. **Checkout do código**  
   Faz o download do repositório para o ambiente de execução.

2. **Configuração do Node.js**  
   Define a versão do Node.js utilizada no job.

3. **Instalação do MongoDB Shell (mongosh)**  
   Faz o download e instalação do pacote `.deb` da versão mais recente estável do `mongosh`.

4. **Verificação da instalação**  
   Executa `mongosh --version` para garantir que o shell foi instalado corretamente.

---
