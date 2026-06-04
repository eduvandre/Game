const pontosElement = document.querySelector('.js-pontos');
const itensElement = document.querySelector('.js-itens');

let pontos = 0;
let ultimoClique = 0;

// Atualiza a interface
function atualizarPontos() {
    pontosElement.innerHTML = `<p>Pontos: ${pontos}</p>`;
}

atualizarPontos();

// Sistema de ataque ao inimigo
document.getElementById('enemy').addEventListener('click', () => {
    const agora = Date.now();

    if (agora - ultimoClique < 1000) return;

    ultimoClique = agora;

    if (machado.hasItem === true) {
        pontos += machado.itemDamage;
        espada.hasItem = false
        atualizarPontos()
        return
    }

    if (espada.hasItem === true) {
        pontos += espada.itemDamage;
    } else {
        pontos++;
    }

    atualizarPontos();
});

// Classe dos itens

class Item {
    constructor(itemName, itemCost, itemDamage) {
        this.itemName = itemName;
        this.itemCost = itemCost;
        this.itemDamage = itemDamage;
        this.hasItem = false;
        this.canBuy = true
    }

    buyItem() {
        if (pontos < this.itemCost) {
            alert('Pontos insuficientes!');
            return;
        } else if (this.canBuy === false) {
            alert('você já tem esse item');
            return;
        }

        this.hasItem = true;
        this.canBuy = false;
        pontos -= this.itemCost;
        atualizarPontos();

        console.log(`Comprou ${this.itemName}`);
    }

    displayItem() {
        const button = document.createElement('button');

        button.classList.add('itemElement');
        button.textContent = `${this.itemName} - Custo: ${this.itemCost}`;

        button.addEventListener('click', () => {
            this.buyItem();
        });

        itensElement.appendChild(button);
    }

}

// Criando itens
const espada = new Item('Espada', 5, 2);
espada.displayItem();

const machado = new Item('Machado', 15, 5);
machado.displayItem();







