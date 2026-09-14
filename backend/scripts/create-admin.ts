import 'reflect-metadata';
import AppDataSource from '../src/database/data-source';
import { User } from '../src/models/User.entity';
import { Role, RoleName } from '../src/models/Role.entity';
import { hashPassword } from '../src/utils/password.util';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function main() {
  await AppDataSource.initialize();

  console.log('🔧 Création d\'un administrateur ODC\n');

  const nom = await ask('Nom       : ');
  const prenom = await ask('Prénom    : ');
  const email = await ask('Email     : ');
  const pwd = await ask('Password  : ');

  const roleRepo = AppDataSource.getRepository(Role);
  const role = await roleRepo.findOne({ where: { nom: RoleName.ADMIN } });
  if (!role) throw new Error('Rôle ADMIN introuvable. Lancez les seeds.');

  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email } });
  if (existing) throw new Error(`Email déjà utilisé : ${email}`);

  const user = userRepo.create({
    nom,
    prenom,
    email,
    motDePasse: await hashPassword(pwd),
    roleId: role.id,
    actif: true,
    emailVerifie: true,
  });

  await userRepo.save(user);
  console.log(`\n✅ Admin créé : ${email}`);
  rl.close();
  await AppDataSource.destroy();
  process.exit(0);
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});