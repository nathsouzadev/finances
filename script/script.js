const Modal = {
    toogle(){
        const active = document.querySelector('.modal-overlay').classList
        active.length > 1 ?
        active.remove('active') :
        active.add('active')
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem('dev.finances: transactions')) || [];
    },
    set(transaction){
        localStorage.setItem('dev.finances: transactions',
        JSON.stringify(transaction))
    }
}

const Transactions = {
    all: Storage.get(),
    add(transaction){
        Transactions.all.push(transaction);
        App.reload();
    },
    remove(index){
        Transactions.all.splice(index, 1);
        App.reload();
    },
    incomes(){
        let income = 0;
        Transactions.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },
    expenses(){
        let expense = 0;
        Transactions.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total(){
        let total = 0;
        for(i = 0; i < Transactions.all.length; i++){
            total += Transactions.all[i].amount
        }
        return total;
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransactions(transaction, index);
        tr.dataset.index = index;
        DOM.transactionContainer.appendChild(tr)
    },
    innerHTMLTransactions(transaction, index){
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
        <td class="description">${transaction.description}</td>
        <td class=${CSSclass}>${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transactions.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
        </td>
        `
        return html
    },
    updateBalance(){
        document
        .querySelector('#incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transactions.incomes());
        document
        .querySelector('#expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transactions.expenses());
        document
        .querySelector('#totalDisplay')
        .innerHTML = Utils.formatCurrency(Transactions.total());
    },
    clearTransactions(){
        DOM.transactionContainer.innerHTML = '';
    }
}

const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? '-' : '';
        value = String(value).replace(/\D/g, '');
        value = Number(value)/100;
        value = value.toLocaleString('pt-BR', {
            style: "currency",
            currency: "BRL"
        })
        return(signal + value)
    },
    formatAmount(value){
        value = Number(value) * 100;
        return value
    },
    formatDate(value){
        const splitedDate = value.split('-');
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields(){
        const { description, amount, date } = Form.getValues(); 
        if(description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Preencha todos os campos')
        }
    },
    formatValues(){
        let { description, amount, date } = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        return{
            description,
            amount,
            date
        }
    },
    clearFields(){
        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = ''
    },
    submit(event){
        event.preventDefault();
        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Transactions.add(transaction);
            Form.clearFields();
            Modal.toogle();
        } catch (error) {
            alert('Preencha todos os campos!')
            console.log(error);
        }
    }
}

const App = {
    init(){
        Transactions.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        Storage.set(Transactions.all)
    },
    reload(){
        DOM.clearTransactions();
        App.init();
    }
}

App.init();
