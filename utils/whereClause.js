//? bigQuery : search=code&page=2&category=shortsleeves&rating[gte]=4&price[lte]=999&price[gte]=199&limit=5

//? base - Product.find()
//? base - Product.find(email : {"someone@gmail.com"})

class whereClause
{
    constructor(base, bigQuery)
    {
        this.base = base;
        this.bigQuery = bigQuery;
    }

    search()
    {
        const searchWord = this.bigQuery.search ? {
            name : {
                $regex: this.bigQuery.search,
                $options: 'i' // i : stands for case insensitive
            }
        } : {}

        this.base = this.base.find({...searchWord});
        return this;
    }

    pager(resultPerPage)
    {
        let currPage = this.bigQuery.page ? this.bigQuery.page : 1;

        const skipVal = resultPerPage * (currPage - 1);

        this.base = this.base.limit(resultPerPage).skip(skipVal);
        return this;
    }

    filter()
    {
        const copyQuery = {...this.bigQuery};

        delete copyQuery["search"];
        delete copyQuery["limit"];
        delete copyQuery["page"];

        //* convert bigQuery into the string => copyQuery
        let stringOfCopyQuery = JSON.stringify(copyQuery);

        stringOfCopyQuery = stringOfCopyQuery.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`);

        const jsonOfCopyQuery = JSON.parse(stringOfCopyQuery);

        this.base = this.base.find(jsonOfCopyQuery);

        return this;
    }
}

module.exports = whereClause;

