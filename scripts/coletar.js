import { execSync } from "child_process";
import { MongoClient } from "mongodb";

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    // Pegar token do Graph via Azure CLI
    const token = execSync(
      'az account get-access-token --resource https://graph.microsoft.com --query accessToken -o tsv',
      { encoding: 'utf-8' }
    ).trim();

    console.log("✅ Token obtido com sucesso via Azure CLI!");

    // Chamada ao Microsoft Graph
    const usersResponse = await fetch("https://graph.microsoft.com/v1.0/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const users = await usersResponse.json();
    console.log(`Usuários retornados: ${users.value?.length || 0}`);

    // Conectar no MongoDB e salvar
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db("graphdb");
    const collection = db.collection("usuarios");

    await collection.insertMany(users.value || []);
    console.log("✅ Dados inseridos no MongoDB");

    await client.close();
  } catch (err) {
    console.error("❌ Erro no script:", err);
    process.exit(1);
  }
}

main();
main().catch(err => {
  console.error("Erro ao executar o script:", err);
  process.exit(1);
});