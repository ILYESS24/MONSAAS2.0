#!/usr/bin/env node

/**
 * Script de déploiement rapide pour Cursor Clone
 * Utilise différentes plateformes de déploiement
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command, description) {
    try {
        log(`📦 ${description}...`, 'cyan');
        execSync(command, { stdio: 'inherit' });
        log(`✅ ${description} terminé`, 'green');
        return true;
    } catch (error) {
        log(`❌ Erreur lors de ${description}: ${error.message}`, 'red');
        return false;
    }
}

function deployToNetlify() {
    log('🚀 Déploiement sur Netlify...', 'magenta');

    // Vérifier si Netlify CLI est installé
    try {
        execSync('netlify --version', { stdio: 'pipe' });
    } catch (error) {
        log('Netlify CLI n\'est pas installé. Installation...', 'yellow');
        if (!executeCommand('npm install -g netlify-cli', 'Installation de Netlify CLI')) {
            log('Veuillez installer Netlify CLI manuellement: npm install -g netlify-cli', 'red');
            return false;
        }
    }

    // Connexion à Netlify
    if (!executeCommand('netlify login', 'Connexion à Netlify')) {
        log('Connexion annulée ou échouée', 'yellow');
        return false;
    }

    // Déploiement
    if (!executeCommand('netlify deploy --prod --dir .', 'Déploiement sur Netlify')) {
        return false;
    }

    log('🎉 Application déployée avec succès sur Netlify !', 'green');
    return true;
}

function deployToVercel() {
    log('🚀 Déploiement sur Vercel...', 'magenta');

    // Vérifier si Vercel CLI est installé
    try {
        execSync('vercel --version', { stdio: 'pipe' });
    } catch (error) {
        log('Vercel CLI n\'est pas installé. Installation...', 'yellow');
        if (!executeCommand('npm install -g vercel', 'Installation de Vercel CLI')) {
            log('Veuillez installer Vercel CLI manuellement: npm install -g vercel', 'red');
            return false;
        }
    }

    // Connexion à Vercel
    if (!executeCommand('vercel login', 'Connexion à Vercel')) {
        log('Connexion annulée ou échouée', 'yellow');
        return false;
    }

    // Déploiement
    if (!executeCommand('vercel --prod', 'Déploiement sur Vercel')) {
        return false;
    }

    log('🎉 Application déployée avec succès sur Vercel !', 'green');
    return true;
}

function deployToSurge() {
    log('🚀 Déploiement sur Surge...', 'magenta');

    // Vérifier si Surge est installé
    try {
        execSync('surge --version', { stdio: 'pipe' });
    } catch (error) {
        log('Surge n\'est pas installé. Installation...', 'yellow');
        if (!executeCommand('npm install -g surge', 'Installation de Surge')) {
            log('Veuillez installer Surge manuellement: npm install -g surge', 'red');
            return false;
        }
    }

    // Générer un nom de domaine aléatoire
    const domainName = `cursor-clone-${Math.random().toString(36).substr(2, 8)}.surge.sh`;

    // Déploiement
    const surgeCommand = `surge . ${domainName}`;
    if (!executeCommand(surgeCommand, `Déploiement sur Surge (${domainName})`)) {
        return false;
    }

    log(`🎉 Application déployée avec succès sur Surge !`, 'green');
    log(`🌐 URL: https://${domainName}`, 'cyan');
    return true;
}

function showMenu() {
    log('\n🚀 Déploiement Cursor Clone', 'bright');
    log('==========================', 'bright');
    log('');
    log('Choisissez votre plateforme de déploiement :', 'yellow');
    log('');
    log('1. 🌐 Netlify (Recommandé)', 'cyan');
    log('2. ⚡ Vercel', 'cyan');
    log('3. 🌊 Surge (Plus rapide)', 'cyan');
    log('4. 📄 GitHub Pages (Gratuit)', 'cyan');
    log('5. 🛠️  Déploiement manuel', 'cyan');
    log('0. ❌ Quitter', 'red');
    log('');
}

function deployToGitHubPages() {
    log('🚀 Configuration GitHub Pages...', 'magenta');

    // Vérifier si git est initialisé
    if (!fs.existsSync('.git')) {
        log('Initialisation du repository git...', 'yellow');
        if (!executeCommand('git init', 'Initialisation git')) return false;
    }

    // Ajouter les fichiers
    if (!executeCommand('git add .', 'Ajout des fichiers')) return false;

    // Commit
    if (!executeCommand('git commit -m "Deploy Cursor Clone"', 'Commit des fichiers')) return false;

    // Instructions pour GitHub
    log('\n📋 Instructions GitHub Pages :', 'yellow');
    log('1. Créez un repository sur GitHub', 'white');
    log('2. Ajoutez le remote :', 'white');
    log('   git remote add origin https://github.com/yourusername/your-repo.git', 'cyan');
    log('3. Poussez le code :', 'white');
    log('   git push -u origin main', 'cyan');
    log('4. Allez dans Settings > Pages', 'white');
    log('5. Sélectionnez "main" branch et "/ (root)"', 'white');
    log('6. Votre site sera disponible à : https://yourusername.github.io/your-repo', 'green');

    return true;
}

function manualDeploy() {
    log('\n📋 Déploiement manuel :', 'yellow');
    log('1. Ouvrez index.html dans votre navigateur', 'white');
    log('2. Ou utilisez un serveur local :', 'white');
    log('   python -m http.server 8000', 'cyan');
    log('   # Puis allez sur http://localhost:8000', 'cyan');
    log('');
    log('3. Pour un déploiement en ligne :', 'white');
    log('   - Glissez-déposez index.html sur Netlify.com', 'cyan');
    log('   - Utilisez surge.sh : npm install -g surge && surge', 'cyan');
    log('   - Ou tout autre hébergeur de fichiers statiques', 'cyan');

    return true;
}

async function main() {
    const args = process.argv.slice(2);

    // Si un argument est passé, déployer directement
    if (args.length > 0) {
        const platform = args[0].toLowerCase();

        switch (platform) {
            case 'netlify':
                return deployToNetlify();
            case 'vercel':
                return deployToVercel();
            case 'surge':
                return deployToSurge();
            case 'github':
                return deployToGitHubPages();
            case 'manual':
                return manualDeploy();
            default:
                log(`Plateforme "${platform}" non reconnue.`, 'red');
                log('Utilisez : netlify, vercel, surge, github, ou manual', 'yellow');
                return false;
        }
    }

    // Menu interactif
    while (true) {
        showMenu();

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const choice = await new Promise(resolve => {
            rl.question('Votre choix (0-5) : ', resolve);
        });

        rl.close();

        let success = false;

        switch (choice) {
            case '1':
                success = deployToNetlify();
                break;
            case '2':
                success = deployToVercel();
                break;
            case '3':
                success = deployToSurge();
                break;
            case '4':
                success = deployToGitHubPages();
                break;
            case '5':
                success = manualDeploy();
                break;
            case '0':
                log('Au revoir ! 👋', 'cyan');
                return true;
            default:
                log('Choix invalide. Veuillez réessayer.', 'red');
                continue;
        }

        if (success && choice !== '5') {
            const deployAgain = await new Promise(resolve => {
                const rl2 = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                rl2.question('\nVoulez-vous déployer ailleurs ? (o/N) : ', resolve);
            });

            if (deployAgain.toLowerCase() !== 'o' && deployAgain.toLowerCase() !== 'y') {
                break;
            }
        }
    }

    return true;
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
    log(`Erreur non gérée: ${error.message}`, 'red');
    process.exit(1);
});

process.on('SIGINT', () => {
    log('\nDéploiement annulé par l\'utilisateur.', 'yellow');
    process.exit(0);
});

// Lancer le script
if (require.main === module) {
    main().then(() => {
        process.exit(0);
    }).catch(error => {
        log(`Erreur fatale: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { deployToNetlify, deployToVercel, deployToSurge, deployToGitHubPages, manualDeploy };
