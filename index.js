const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');
const { books, authors } = require('./database');


const app = express();

const PORT = 5000;

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represents an author",
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books: {
            type: GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id);
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This represents a book",
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: GraphQLNonNull(AuthorType),
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId )
            }
        }
    })
})

const rootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: "Root query",
    fields: () => ({
        book: {
            type: BookType,
            description: 'A single book',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return books.find(book => book.id === args.id)
            }
        },
        author: {
            type: AuthorType,
            description: 'A single author',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return authors.find(author => author.id === args.id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            description: "List of ALL books",
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of ALL authors",
            resolve: () => authors
        }
    })
})

const rootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add book to book list",
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: { type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book);
                return book;

            }
        },
        deleteBook: {
            type: GraphQLList(BookType),
            description: "Delete book from book list",
            args: {
                id: { type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                for(let i = 0; i < books.length; i++){
                    if(args.id == books[i].id){
                        books.splice(i, 1);
                    }
                }
                return books;
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "Add author to book list",
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name,
                }
                authors.push(author);
                return author;

            }
        },
        deleteAuthor: {
            type: GraphQLList(AuthorType),
            description: "Delete author from author list",
            args: {
                id: { type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                for(let i = 0; i < author.length; i++){
                    if(args.id == authors[i].id){
                        authors.splice(i, 1);
                    }
                }
                return authors;
            }
        },
    })
})

const schema = new GraphQLSchema({
    query: rootQueryType,
    mutation: rootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

app.listen(5000, () => {
    console.log(`Server running on port ${PORT}`)
})