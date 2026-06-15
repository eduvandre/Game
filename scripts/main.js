const pontosElement = document.querySelector('.js-pontos');
const itensElement = document.querySelector('.js-itens');

let pontos = 0;
let ultimoClique = 0;

// Vida do inimigo
let enemyLife = 100;
const maxEnemyLife = 100;

// Atualiza os pontos
function atualizarPontos() {
    pontosElement.innerHTML = `<p>Pontos: ${pontos}</p>`;
}

// Atualiza a barra de vida
function atualizarVidaEnemy() {
    const barra = document.getElementById('enemyLifeBar');

    if (!barra) return;

    barra.style.width = `${(enemyLife / maxEnemyLife) * 100}%`;
}

// Classe dos itens
class Item {
    constructor(itemName, itemCost, itemDamage) {
        this.itemName = itemName;
        this.itemCost = itemCost;
        this.itemDamage = itemDamage;
        this.hasItem = false;
    }

    buyItem() {
        if (pontos < this.itemCost) {
            alert('Pontos insuficientes!');
            return;
        }

        this.hasItem = true;
        pontos -= this.itemCost;

        atualizarPontos();
        atualizarLoja();

        if (bladeOfChaos.hasItem) {
            itensElement.innerHTML =
                `<button class="item">Não há mais itens</button>`;
            return;
        }

        console.log(`Comprou ${this.itemName}`);
    }

    displayItem() {
        itensElement.innerHTML = `
            <button class="item">
                Melhorar Arma<br>
                Nome: ${this.itemName}<br>
                Dano: ${this.itemDamage}<br>
                Custo: ${this.itemCost}
            </button>
        `;

        document.querySelector('.item').addEventListener('click', () => {
            this.buyItem();
        });
    }
}

// Criando itens
const orcrist = new Item('Orcrist', 5, 2);
const aerondight = new Item('Aerondight', 10, 5);
const dreamseeker = new Item('Dreamseeker', 15, 10);
const bladeOfChaos = new Item('Blade of Chaos', 20, 15);

// Primeiro item da loja
orcrist.displayItem();

// Atualiza a loja
function atualizarLoja() {
    if (orcrist.hasItem && !aerondight.hasItem) {
        aerondight.displayItem();
    }

    if (aerondight.hasItem && !dreamseeker.hasItem) {
        dreamseeker.displayItem();
    }

    if (dreamseeker.hasItem && !bladeOfChaos.hasItem) {
        bladeOfChaos.displayItem();
    }
}

// Inicialização
atualizarPontos();
atualizarVidaEnemy();

// Sistema de ataque ao inimigo
document.getElementById('enemy').addEventListener('click', () => {
    const agora = Date.now();

    if (agora - ultimoClique < 200) return;

    ultimoClique = agora;

    let dano = 1;

    if (bladeOfChaos.hasItem) {
        dano = bladeOfChaos.itemDamage;
    } else if (dreamseeker.hasItem) {
        dano = dreamseeker.itemDamage;
    } else if (aerondight.hasItem) {
        dano = aerondight.itemDamage;
    } else if (orcrist.hasItem) {
        dano = orcrist.itemDamage;
    }

    // Dano no inimigo
    enemyLife -= dano;

    // Ganha pontos
    pontos += dano;

    // Inimigo derrotado
    if (enemyLife <= 0) {
        enemyLife = 0;

        atualizarVidaEnemy();

        alert('Inimigo derrotado!');

        // Respawn
        enemyLife = maxEnemyLife;
    }

    atualizarVidaEnemy();
    atualizarPontos();
});

const player = document.getElementById('player');
// Esquiva direita e  esquerda

document.getElementById('leftBtn').addEventListener('click', () => {

// Esquiva Esquerda

    player.style.backgroundImage = 'url("https://imgs.search.brave.com/HJTVlNC76t7geufwcc7RDA5KL5Kr5jxlCEwFG7PeWYc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLmt5/bS1jZG4uY29tL2Vu/dHJpZXMvaWNvbnMv/ZmFjZWJvb2svMDAw/LzA0OC8yNTEvQ2Fs/bWFfQ2FsYWJyZXNv/LmpwZw")';
    player.style.transform = "translateX(-50px)";

// Original

    setTimeout(() => {
        player.style.backgroundImage = 'url("https://cdn.discordapp.com/attachments/763190821301780491/1512238680863936582/amigo_1.png?ex=6a313545&is=6a2fe3c5&hm=1ba1592f1277339dcd5a547bd44a36ee525d75564ccebd648964587308254b0a&")';
        player.style.transform = "translateX(0)";
    }, 300);
});

document.getElementById('rightBtn').addEventListener('click', () => {

// Esquiva Direita

    player.style.backgroundImage = 'url("https://imgs.search.brave.com/HJTVlNC76t7geufwcc7RDA5KL5Kr5jxlCEwFG7PeWYc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLmt5/bS1jZG4uY29tL2Vu/dHJpZXMvaWNvbnMv/ZmFjZWJvb2svMDAw/LzA0OC8yNTEvQ2Fs/bWFfQ2FsYWJyZXNv/LmpwZw")';
    player.style.transform = "translateX(50px)";

// Original
    setTimeout(() => {
        player.style.backgroundImage = 'url("https://cdn.discordapp.com/attachments/763190821301780491/1512238680863936582/amigo_1.png?ex=6a313545&is=6a2fe3c5&hm=1ba1592f1277339dcd5a547bd44a36ee525d75564ccebd648964587308254b0a&")';
        player.style.transform = "translateX(0)";
    }, 300);
});