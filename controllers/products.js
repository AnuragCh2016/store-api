import { Product } from "../models/product.js";

export class ProductController {
  static getAllProductsStatic = async (req, res) => {
    const product = await Product.find({
        'price':{$gt:30}
    })
      .sort("price")
      .select("name price")
      .limit(10)
    //   .skip(10);
    // console.log(product);
    res.status(200).json({ product, nbHits: product.length });
  };

  static getProducts = async (req, res, next) => {
    const { featured, company, name, sort, fields,numericFilters } = req.query;
    const queryObject = {};
    if (featured) {
      queryObject.featured = featured === "true" ? true : false;
    }
    if (company) {
      queryObject.company = company;
    }
    if (name) {
      queryObject.name = { $regex: name, $options: "i" };
    }

    //numeric filters
    if(numericFilters){
        //numrericFilters = 'price>30,rating>=4'
        const operatorMap = {
            '>': '$gt',
            '<': '$lt',
            '=': '$eq',
            '>=': '$gte',
            '<=': '$lte'
        }
        const regEx = /\b(<|>|=|<=|>=)\b/g
        let filters = numericFilters.replace(regEx,(match)=>`-${operatorMap[match]}-`);
        //filters = 'price-$gt-30,rating-$gte-4'
        //split twice -- once to get filter for each field
        
        //alternate working below. For this ↓, no check that field exists
        /* let splitFilters = filters.split(',')   //['price-$gt-30','rating-$gte-4']
        for(let filter of splitFilters){
            let criteria = filter.split('-');   //['price','$gt','30'],['rating','$gte','4'];
            queryObject[criteria[0]]={};
            queryObject[criteria[0]][criteria[1]]=Number(criteria[2]);
        } */
    
        //alternate working -
        const options = ['price','rating']  //only numerical fields in schema
        filters = filters.split(',').forEach((el)=>{
            const [field,operator,value] = el.split('-');
            if(options.includes(field)){
                queryObject[field]={};
                queryObject[field][operator]=Number(value);
            }
        })
    }

    // console.log(queryObject)

    /* 
    if(sort){   //suppose sort='-name,price'
        const check = sort.split(',');
        for(const el of check)
            sortParams.push(el);
        // console.log(sortParams);
    }
    console.log(queryObject)
    const sortString = sortParams.join(' ');
    console.log(sortString) */

    //since sort function is chained to query, if we await the query, we no longer have it later. so we do -

    //for sorting query, since we cannot add sorting in the queryObject, we must keep the query alive to chain the sort later
    let result = Product.find(queryObject);

    //sort
    if (sort) {
      //sort logic, chain to result
      const sortString = sort.split(",").join(" ");
      result = result.sort(sortString);
    } else {
      result = result.sort("createdAt");
    }

    //select
    if (fields) {
      //i expect fields to be like /?fields=name,price
      const selections = fields.split(",").join(" "); //selections = 'name price'
      result = result.select(selections);
    }

    //pagination
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const skip = (page - 1) * limit;

    


    result = result.skip(skip).limit(limit);

    const data = await result;
    res.status(200).json({ data, nbHits: data.length });
  };

  static getSingleProduct = async (req, res, next) => {
    const { id: productID } = req.params;
    const product = await Product.findById(productID);
    if (!product) {
      throw new Error("No such product");
    }
    res.status(200).json({ product, nbHits: product.length });
  };
}
