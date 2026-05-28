const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

async function generate() {
    const certsDir = path.join(__dirname, 'certs');

    if (!fs.existsSync(certsDir)) {
        fs.mkdirSync(certsDir, { recursive: true });
    }

    const attrs = [{ name: 'commonName', value: 'localhost' }];

    const pems = await selfsigned.generate(attrs, {
        days: 365,
        algorithm: 'sha256',
        extensions: [
            { name: 'subjectAltName', altNames: [
                { type: 2, value: 'localhost' },
                { type: 7, ip: '127.0.0.1' },
                { type: 7, ip: '::1' }
            ]}
        ],
        keySize: 2048
    });

    fs.writeFileSync(path.join(certsDir, 'cert.pem'), pems.cert);
    fs.writeFileSync(path.join(certsDir, 'key.pem'), pems.private);

    console.log('Certificats SSL générés dans app/certs/');
    console.log('  - cert.pem (certificat)');
    console.log('  - key.pem (clé privée)');
}

generate().catch(err => {
    console.error('Erreur lors de la génération des certificats:', err);
    process.exit(1);
});
