// Usando seu schema existente
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { schema } = require('./db/schema'); // Ajuste o caminho conforme necessário

async function clearAllTablesWithSchema() {
  console.log('Iniciando limpeza com schema do projeto...');
  
  const connectionString = "postgresql://federal-saas_owner:npg_KbV8zHeQ6DLp@ep-dry-lake-a4isdveg-pooler.us-east-1.aws.neon.tech/federal-saas?sslmode=require";
  
  const client = postgres(connectionString, {
    max: 1,
    idle_timeout: 30,
    connect_timeout: 30,
    ssl: { rejectUnauthorized: false }
  });
  
  const db = drizzle(client, { schema });
  
  try {
    console.log('Desativando restrições de chave estrangeira...');
    await client`SET session_replication_role = 'replica'`;
    
    // Limpar todas as tabelas definidas no schema
    for (const tableName in schema) {
      if (schema[tableName]?.$table?.name) {
        const name = schema[tableName].$table.name;
        console.log(`Limpando tabela: ${name}`);
        await client`TRUNCATE TABLE ${client(name)} CASCADE`;
        console.log(`✅ Tabela ${name} limpa com sucesso.`);
      }
    }
    
    await client`SET session_replication_role = 'origin'`;
    console.log('✅ Limpeza concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.end();
  }
}

clearAllTablesWithSchema();