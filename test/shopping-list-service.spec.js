const ShoppingListService = require('../src/shopping-list-service');
const knex = require('knex');

describe('Shopping List Service Object', function() {
    let db;
    const testShoppingList = [
        {
            id: 1,
            name: "First Item",
            price: "1.00",
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            checked: true,
            category: "Main"
        },
        {
            id: 2,
            name: "Second Item",
            price: "2.00",
            date_added: new Date('2100-05-22T16:28:32.615Z'),
            checked: false,
            category: "Snack"
        },
        {
            id: 3,
            name: "Third Item",
            price: "3.00",
            date_added: new Date('1919-12-22T16:28:32.615Z'),
            checked: true,
            category: "Lunch"
        },
        {
            id: 4,
            name: "Fourth Item",
            price: "4.00",
            date_added: new Date('1919-12-22T16:28:32.615Z'),
            checked: false,
            category: "Breakfast"
        },
    ];

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    });

    before(() => db('shopping_list').truncate());

    after(() => db.destroy());

    afterEach(() => db('shopping_list').truncate());

    context(`Given 'shopping_list' has data`, () => {
        beforeEach(() => {
            return db
                .into('shopping_list')
                .insert(testShoppingList)
        });
        it(`getAllItems() resolves all articles from 'shopping_list table`, () => {
            return ShoppingListService.getAllItems(db)
                .then(actual => {
                    expect(actual).to.eql(testShoppingList)
                })
        });
        it(`getById() resolves an item by id from 'shopping_list' table`, () => {
            const thirdId = 3
            const thirdTestItem = testShoppingList[thirdId - 1]
            return ShoppingListService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        name: thirdTestItem.name,
                        price: thirdTestItem.price,
                        date_added: thirdTestItem.date_added,
                        checked: thirdTestItem.checked,
                        category: thirdTestItem.category
                    })
                })
        });
        it(`deleteItem() removes an item by id from 'shopping_list' table`, () => {
            const itemId = 3
            return ShoppingListService.deleteItem(db, itemId)
                .then(() => ShoppingListService.getAllItems(db))
                .then(allItems => {
                    const expected = testShoppingList.filter(item => item.id !== itemId)
                    expect(allItems).to.eql(expected)
                })
        });
        it(`updateItem() updates an item from the 'shopping_list' table`, () => {
            const idOfItemToUpdate = 2;
            const newItemData = {
                name: 'updated name',
                price: "7.00",
                date_added: new Date(),
                checked: true,
                category: 'Lunch'
            };
            return ShoppingListService.updateItem(db, idOfItemToUpdate, newItemData)
                .then(() => ShoppingListService.getById(db, idOfItemToUpdate))
                .then(item => {
                    expect(item).to.eql({
                        id: idOfItemToUpdate,
                        ...newItemData
                    })
                })
        });
    });
    
    context(`Given 'shopping_list' has no data`, () => {
        it(`getAllItems() resolves an empty array`, () =>{
            return ShoppingListService.getAllItems(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        });
        it(`insertItem() inserts a new item and resolves the new item with an 'id'`, () => {
            const newItem = {
                name: "Inserted Item",
                price: "27.00",
                date_added: new Date('1919-12-22T16:28:32.615Z'),
                category: "Breakfast"
            };
            return ShoppingListService.insertItem(db, newItem)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        name: newItem.name,
                        price: newItem.price,
                        date_added: newItem.date_added,
                        checked: false,
                        category: newItem.category
                    })
                })
        });
    });

})