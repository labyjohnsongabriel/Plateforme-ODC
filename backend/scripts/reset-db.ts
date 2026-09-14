import 'reflect-metadata';
import AppDataSource from '../src/database/data-source';

async function main() {
  console.log('⚠️  Réinitialisation de la base de données...');
  await AppDataSource.initialize();

  // Supprimer toutes les tables
  await AppDataSource.dropDatabase();
  console.log('✅ Base supprimée');

  // Recréer
  await AppDataSource.synchronize();
  console.log('✅ Tables recréées');

  await AppDataSource.destroy();
  process.exit(0);
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});