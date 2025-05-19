import BookList from '../views/word/BookList.vue'
import BookEdit from '../views/word/BookEdit.vue'
import WordList from '../views/word/WordList.vue'

export default [
    {
        path: '/books',
        name: 'bookList',
        component: BookList,
    },
    {
        path: '/books/edit',
        name: 'bookEdit',
        component: BookEdit,
    },
    {
        path: '/books/:bookId/words',
        name: 'wordList',
        component: WordList,
    }
]
