import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import readline from 'readline';
import { CINEMA_PRESETS, BASIC_STARTER_LUTS, applyPresetToState } from './utils/presets';
import { DEFAULT_GRADING_STATE, generateCubeLUT } from './utils/colorScience';

const WIN_RESOLVE_EXE = 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Resolve.exe';
const WIN_RESOLVE_LUT_DIR = 'C:\\ProgramData\\Blackmagic Design\\DaVinci Resolve\\Support\\LUT\\ResolveLUT_Studio';

function isAdministrator(): boolean {
  try {
    execSync('net session', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function elevateProcess() {
  const exePath = process.execPath;
  console.log('\n[!] Solicitare drepturi de Administrator Windows 11 (UAC)...');
  try {
    const psCmd = `powershell -Command "Start-Process -FilePath '${exePath}' -Verb RunAs"`;
    execSync(psCmd, { stdio: 'inherit' });
  } catch (err) {
    console.log('Eroare sau UAC refuzat de utilizator.');
  }
  process.exit(0);
}

function installAllLuts() {
  console.log('\n========================================================================');
  console.log('  Instalare LUT-uri in DaVinci Resolve Studio (Rec.709 Gamma 2.4)');
  console.log('========================================================================');
  console.log(`Director tinta: ${WIN_RESOLVE_LUT_DIR}`);

  try {
    if (!fs.existsSync(WIN_RESOLVE_LUT_DIR)) {
      fs.mkdirSync(WIN_RESOLVE_LUT_DIR, { recursive: true });
      console.log('[+] Directorul LUT a fost creat.');
    }

    const allPresets = [...CINEMA_PRESETS, ...BASIC_STARTER_LUTS];
    let count = 0;

    for (const preset of allPresets) {
      const state = applyPresetToState(DEFAULT_GRADING_STATE, preset);
      const cubeContent = generateCubeLUT(state, 33);
      const sanitizedName = preset.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = path.join(WIN_RESOLVE_LUT_DIR, `${sanitizedName}_Resolve33.cube`);
      fs.writeFileSync(filename, cubeContent, 'utf8');
      count++;
    }

    console.log(`[+] Succes! ${count} LUT-uri au fost instalate in DaVinci Resolve Studio!`);
  } catch (err: any) {
    console.error(`[-] Eroare la scrierea LUT-urilor: ${err.message}`);
    console.log('    Asigurati-va ca rulati aplicatia cu drepturi de Administrator.');
  }
}

function launchDaVinciResolve() {
  console.log('\n========================================================================');
  console.log('  Pornire DaVinci Resolve Studio cu Drepturi de Administrator');
  console.log('========================================================================');

  if (fs.existsSync(WIN_RESOLVE_EXE)) {
    console.log(`[+] Se lanseaza: ${WIN_RESOLVE_EXE}`);
    try {
      execSync(`powershell -Command "Start-Process '${WIN_RESOLVE_EXE}' -Verb RunAs"`);
      console.log('[+] DaVinci Resolve Studio a fost pornit cu succes!');
    } catch (err: any) {
      console.error(`[-] Eroare la pornirea DaVinci Resolve: ${err.message}`);
    }
  } else {
    console.log(`[!] DaVinci Resolve Studio nu a fost gasit la locatia implicita:`);
    console.log(`    ${WIN_RESOLVE_EXE}`);
    console.log('    Daca este instalat intr-o alta partitie, lansati-l manual;');
    console.log(`    LUT-urile sunt instalate in: ${WIN_RESOLVE_LUT_DIR}`);
  }
}

function openLutFolderInExplorer() {
  if (fs.existsSync(WIN_RESOLVE_LUT_DIR)) {
    execSync(`explorer.exe "${WIN_RESOLVE_LUT_DIR}"`);
    console.log(`[+] Directorul ${WIN_RESOLVE_LUT_DIR} a fost deschis in Windows Explorer.`);
  } else {
    console.log(`[!] Directorul ${WIN_RESOLVE_LUT_DIR} nu exista inca. Rulati optiunea 1 de instalare.`);
  }
}

function main() {
  console.clear();
  console.log('========================================================================');
  console.log('  ResolveLUT Studio - Windows 11 Native Administrator Bridge');
  console.log('  Integrare Blackmagic Design DaVinci Resolve Studio (x64)');
  console.log('========================================================================');

  if (!isAdministrator()) {
    console.log('[!] Acest executabil necesita drepturi de Administrator pentru a scrie');
    console.log('    in directorul protejat de sistem C:\\ProgramData al DaVinci Resolve.');
    elevateProcess();
    return;
  }

  console.log('[✓] Rulare confirmata cu drepturi de Administrator Windows 11 (UAC Elevated)');

  // Auto-install LUTs on first run
  installAllLuts();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function showMenu() {
    console.log('\n------------------------------------------------------------------------');
    console.log('  Meniu Optiuni Windows 11 & DaVinci Resolve:');
    console.log('------------------------------------------------------------------------');
    console.log('  [1] Porneste DaVinci Resolve Studio ca Administrator');
    console.log('  [2] Reinstaleaza / Actualizeaza toate LUT-urile de Nunta');
    console.log('  [3] Deschide directorul de LUT-uri in Windows Explorer');
    console.log('  [4] Iesire');
    console.log('------------------------------------------------------------------------');
    rl.question('Alegeti o optiune (1-4): ', (answer) => {
      switch (answer.trim()) {
        case '1':
          launchDaVinciResolve();
          showMenu();
          break;
        case '2':
          installAllLuts();
          showMenu();
          break;
        case '3':
          openLutFolderInExplorer();
          showMenu();
          break;
        case '4':
          console.log('\nLa revedere!');
          rl.close();
          process.exit(0);
          break;
        default:
          console.log('Optiune invalida.');
          showMenu();
          break;
      }
    });
  }

  showMenu();
}

main();
