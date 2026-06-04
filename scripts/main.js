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

    if (agora - ultimoClique < 200) return;

    ultimoClique = agora;

    if (bladeOfChaos.hasItem) {
        pontos += bladeOfChaos.itemDamage
        atualizarPontos()
        return
    } else if (dreamseeker.hasItem) {
        pontos += dreamseeker.itemDamage
        atualizarPontos()
        return
    } else if (aerondight.hasItem) {
        pontos += aerondight.itemDamage
        atualizarPontos()
        return
    } else if (orcrist.hasItem) {
        pontos += orcrist.itemDamage 
        atualizarPontos()
        return
    } else if (!orcrist.hasItem) {
        pontos++
        atualizarPontos()
        return
    } 

});

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
        } else

        this.hasItem = true;
        pontos -= this.itemCost;
        atualizarPontos();
        atualizarLoja();

        if (bladeOfChaos.hasItem) {
            itensElement.innerHTML = `<button class="item">Não há mais itens</button>`
            return
        }

        console.log(`Comprou ${this.itemName}`);
    }

    displayItem() {
        itensElement.innerHTML = `<button class="item">Melhorar Arma<br>Nome:${this.itemName}<br>Dano:${this.itemDamage}<br>Custo:${this.itemCost}</button>`

        document.querySelector('.item').addEventListener('click', () => {
            this.buyItem()
        })
    }
}

// Criando itens

const orcrist = new Item('Orcrist',5,2);
orcrist.displayItem();
const aerondight = new Item('Aerondight',10,5);
const dreamseeker = new Item('Dreamseeker',15,10);
const bladeOfChaos = new Item('Blade of Chaos',20,15)

function atualizarLoja() {

    if (orcrist.hasItem && !aerondight.hasItem) {
        aerondight.displayItem();
    }

    if (aerondight.hasItem && !dreamseeker.hasItem) {
        dreamseeker.displayItem();
    }

    if (dreamseeker.hasItem && !bladeOfChaos.hasItem) {
        bladeOfChaos.displayItem()
    }

}









