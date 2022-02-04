import * as cord from '@cord.network/api'
import { Crypto, UUID } from '@cord.network/utils'
import * as json from 'multiformats/codecs/json'
import { blake2b256 as hasher } from '@multiformats/blake2/blake2b'
import { CID } from 'multiformats/cid'
import type { KeyringPair } from '@polkadot/keyring/types'

const AUTH_SEED =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
const ENC_SEED =
  '0x0000000000000000000000000000000000000000000000000000000000000001'
const ATT_SEED =
  '0x0000000000000000000000000000000000000000000000000000000000000002'
const DEL_SEED =
  '0x0000000000000000000000000000000000000000000000000000000000000003'

export function generate_ed25519_authentication_key(): KeyringPair {
  return cord.Identity.buildFromSeedString(AUTH_SEED, {
    signingKeyPairType: 'ed25519',
  }).signKeyringPair
}
export function get_ed25519_authentication_key_id(): string {
  return '0xed52d866f75a5e57641b6ca68a7618312564de787cda3d0664d15471ec1d12b5'
}

export function generate_sr25519_authentication_key(): KeyringPair {
  return cord.Identity.buildFromSeedString(AUTH_SEED, {
    signingKeyPairType: 'sr25519',
  }).signKeyringPair
}
export function get_sr25519_authentication_key_id(): string {
  return '0x1eb4134f8acf477337de6b208c1044b19b9ac09e20e4c6f6c1561d1cef6cad8b'
}

export function generate_encryption_key(): nacl.BoxKeyPair {
  return cord.Identity.buildFromSeedString(ENC_SEED, {
    signingKeyPairType: 'ed25519',
  }).boxKeyPair
}
export function get_encryption_key_id(): string {
  return '0xd8752aed376a12f17ee8c5e06aa19df1cea571da1c9241fc50c330504513b350'
}

export function generate_ed25519_anchor_key(): KeyringPair {
  return cord.Identity.buildFromSeedString(ATT_SEED, {
    signingKeyPairType: 'ed25519',
  }).signKeyringPair
}
export function get_ed25519_anchor_key_id(): string {
  return '0xee643cd1b9567e60b913ef6d7b99e117277413736955051b891b07fa2cff1ca2'
}

export function generate_sr25519_anchor_key(): KeyringPair {
  return cord.Identity.buildFromSeedString(ATT_SEED, {
    signingKeyPairType: 'sr25519',
  }).signKeyringPair
}
export function get_sr25519_anchor_key_id(): string {
  return '0x8ab41dc8ddfecb44ca18658b0a34becdcc0580096855c9f7cbb8575b02356286'
}

export function generate_ed25519_delegation_key(): KeyringPair {
  return cord.Identity.buildFromSeedString(DEL_SEED, {
    signingKeyPairType: 'ed25519',
  }).signKeyringPair
}
export function get_ed25519_delegation_key_id(): string {
  return '0xe8633ac00f7cf860d6310624c721e4229d7f661de9afd885cd2d422fd15b7669'
}

export function generate_sr25519_delegation_key(): KeyringPair {
  return cord.Identity.buildFromSeedString(DEL_SEED, {
    signingKeyPairType: 'sr25519',
  }).signKeyringPair
}
export function get_sr25519_delegation_key_id(): string {
  return '0x81dc5bf133b998d615b70563ee94e92296e1219f8235b008b38a2ddb40168a35'
}

export async function waitForEnter(message?: string) {
  const waitForEnter = require('wait-for-enter')
  message = message || 'Press Enter to continue: '
  console.log(message)
  await waitForEnter()
}

const NUMBER_OF_ORDERS = 8
const NUMBER_OF_RATING = 5

function between(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

export async function createIdentities() {

    // Step 1: Setup Org Identity
    console.log(`\n🏛  Creating Identities\n`)
    //3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi
    const networkAuthor = cord.Identity.buildFromURI('//Alice', {
	signingKeyPairType: 'sr25519',
    })
    const productOwner = cord.Identity.buildFromURI('//Bob', {
	signingKeyPairType: 'sr25519',
    })
    const sellerOne = cord.Identity.buildFromURI('//SellerOne', {
	signingKeyPairType: 'sr25519',
    })
    const sellerTwo = cord.Identity.buildFromURI('//SellerTwo', {
	signingKeyPairType: 'sr25519',
    })
    const buyerOne = cord.Identity.buildFromURI('//BuyerOne', {
	signingKeyPairType: 'sr25519',
    })

    console.log(
	`🔑 Network Author Address (${networkAuthor.signingKeyType}): ${networkAuthor.address}`
    )
    console.log(
	`🔑 Product Controller Address (${productOwner.signingKeyType}): ${productOwner.address}`
    )
    console.log(
	`🔑 Seller One Address (${sellerOne.signingKeyType}): ${sellerOne.address}`
    )
    console.log(
	`🔑 Seller Two Address (${sellerTwo.signingKeyType}): ${sellerTwo.address}`
    )
    console.log(
	`🔑 Buyer One Address (${buyerOne.signingKeyType}): ${buyerOne.address}\n`
    )
    return { networkAuthor, productOwner, sellerOne, sellerTwo, buyerOne }
}


export async function registerProducts(id: any) {
    
    console.log(`\n\n✉️  Adding a new Product Schema \n`)
    let newProdSchemaContent = require('../res/prod-schema.json')
    let newProdSchemaName = newProdSchemaContent.name + ':' + UUID.generate()
    newProdSchemaContent.name = newProdSchemaName

    let newProductSchema = cord.Schema.fromSchemaProperties(
	newProdSchemaContent,
	id.productOwner!.address
    )

    let bytes = json.encode(newProductSchema)
    let encoded_hash = await hasher.digest(bytes)
    const schemaCid = CID.create(1, 0xb220, encoded_hash)

    let productSchemaCreationExtrinsic = await newProductSchema.store(
	schemaCid.toString()
    )
    console.log(`📧 Schema Details `)
    console.dir(newProductSchema, { depth: null, colors: true })
    console.log(`CID: `, schemaCid.toString())
    console.log('\n⛓  Anchoring Schema to the chain...')
    console.log(`🔑 Controller: ${id.productOwner!.address} `)

    try {
	await cord.ChainUtils.signAndSubmitTx(
	    productSchemaCreationExtrinsic,
	    id.productOwner!,
	    {
		resolveOn: cord.ChainUtils.IS_READY,
	    }
	)
	console.log('✅ Schema created!')
    } catch (e: any) {
	console.log(e.errorCode, '-', e.message)
    }

    let productSchemaDelegateExtrinsic = await newProductSchema.add_delegate(
	id.sellerOne!.address
    )

    console.log(`📧 Schema Delegation `)
    try {
	await cord.ChainUtils.signAndSubmitTx(
	    productSchemaDelegateExtrinsic,
	    id.productOwner!,
	    {
		resolveOn: cord.ChainUtils.IS_READY,
	    }
	)
	console.log('✅ Schema Delegation added: ${sellerOne.address}')
    } catch (e: any) {
	console.log(e.errorCode, '-', e.message)
    }

    // Step 2: Setup a new Product
    console.log(`\n✉️  Listening to new Product Additions`, '\n')
    let products: any = [];
    for (let i = 0; i < 10 ; i++) {
	let content = {
	    name: 'Sony OLED 55 Inch Television',
	    description: 'Best Television in the World',
	    countryOfOrigin: 'India',
	    gtin: UUID.generate(),
	    brand: 'Sony OLED',
	    manufacturer: 'Sony',
	    model: '2022',
	    sku: UUID.generate(),
	}

	let productStream = cord.Content.fromSchemaAndContent(
	    newProductSchema,
	    content,
	    id.productOwner!.address
	)
	console.log(`📧 Product Details `)
	console.dir(productStream, { depth: null, colors: true })

	let newProductContent = cord.ContentStream.fromStreamContent(
	    productStream,
	    id.productOwner!
	)
	console.log(`\n📧 Hashed Product Stream `)
	console.dir(newProductContent, { depth: null, colors: true })

	bytes = json.encode(newProductContent)
	encoded_hash = await hasher.digest(bytes)
	const streamCid = CID.create(1, 0xb220, encoded_hash)

	let newProduct = cord.Product.fromProductContentAnchor(
	    newProductContent,
	    streamCid.toString()
	)

	let productCreationExtrinsic = await newProduct.create()

	console.log(`\n📧 Stream On-Chain Details`)
	console.dir(newProduct, { depth: null, colors: true })

	console.log('\n⛓  Anchoring Product to the chain...')
	console.log(`🔑 Controller: ${id.productOwner!.address} `)

	try {
	    await cord.ChainUtils.signAndSubmitTx(
		productCreationExtrinsic,
		id.productOwner!,
		{
		    resolveOn: cord.ChainUtils.IS_IN_BLOCK,
		}
	    )
	} catch (e: any) {
	    console.log(e.errorCode, '-', e.message)
	}
	products.push({
	    product: newProduct,
	    prodContent: content,
	    schema: newProductSchema,
	    stream: productStream,
	})
    }
    return { products, schema: newProductSchema};
}

export async function addProductListing(id: any, schema: any, products: any) {
    let listings: any = [];
    console.log(`\n\n✉️  Listening to Product Listings \n`)
    let store_name = 'ABC Store'
    let price = 135000
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
	let listStream = cord.Content.fromSchemaAndContent(
	    schema,
	    product.stream!.contents,
	    id.sellerOne!.address
	)
	console.log(`📧 Product Listing Details `)
	console.dir(product.stream!, { depth: null, colors: true })

	let newListingContent = cord.ContentStream.fromStreamContent(
	    listStream,
	    id.sellerOne!,
	    {
		link: product.product!.id!,
	    }
	)
	console.log(`\n📧 Hashed Product Stream `)
	console.dir(newListingContent, { depth: null, colors: true })

	let bytes = json.encode(newListingContent)
	let encoded_hash = await hasher.digest(bytes)
	const listCid = CID.create(1, 0xb220, encoded_hash)
	const storeVal = {
	    store: store_name,
	    seller: id.sellerOne!.address,
	}
	const storeId = Crypto.hashObjectAsStr(storeVal)

	let newListing = cord.Product.fromProductContentAnchor(
	    newListingContent,
	    listCid.toString(),
	    storeId.toString(),
	    price
	)

	let listingCreationExtrinsic = await newListing.list()

	console.log(`\n📧 Listing On-Chain Details`)
	console.dir(newListing, { depth: null, colors: true })
	console.log('\n⛓  Anchoring Product Lisiting Event to the chain...')
	console.log(`🔑 Controller: ${id.sellerOne!.address} `)

	try {
	    await cord.ChainUtils.signAndSubmitTx(
		listingCreationExtrinsic,
		id.networkAuthor!,
		{
		    resolveOn: cord.ChainUtils.IS_IN_BLOCK,
		}
	    )
	} catch (e: any) {
	    console.log(e.errorCode, '-', e.message)
	}

	listings.push({ listing: newListing, product: product });
    }

    return listings;
}

export async function placeOrder(id: any, schema: any, listings: any) {
    let orders: any = []
    let price = 135000
    console.log(`\n\n✉️  Listening to Product Orders \n`)

    for (let i = 0; i < NUMBER_OF_ORDERS; i++) {
	let inventory = listings[between(0, listings.length)];
	let orderStream = cord.Content.fromSchemaAndContent(
	    schema,
	    inventory.product!.stream!.contents,
	    id.buyerOne!.address
	)
	console.log(`📧 Product Order Details `)
	console.dir(orderStream, { depth: null, colors: true })

	let newOrderContent = cord.ContentStream.fromStreamContent(
	    orderStream,
	    id.buyerOne!,
	    {
		link: inventory.listing!.id,
	    }
	)
	console.log(`\n📧 Hashed Order Stream `)
	console.dir(newOrderContent, { depth: null, colors: true })

	let bytes = json.encode(newOrderContent)
	let encoded_hash = await hasher.digest(bytes)
	const orderCid = CID.create(1, 0xb220, encoded_hash)

	let newOrder = cord.Product.fromProductContentAnchor(
	    newOrderContent,
	    orderCid.toString(),
	    inventory.listing!.store_id,
	    price
	)

	let orderCreationExtrinsic = await newOrder.order()

	console.log(`\n📧 Order On-Chain Details`)
	console.dir(newOrder, { depth: null, colors: true })
	console.log('\n⛓  Anchoring Product Ordering Event to the chain...')
	console.log(`🔑 Controller: ${id.buyerOne!.address} `)

	try {
	    await cord.ChainUtils.signAndSubmitTx(
		orderCreationExtrinsic,
		id.networkAuthor!,
		{
		    resolveOn: cord.ChainUtils.IS_IN_BLOCK,
		}
	    )
	    console.log(`✅ Order (${newOrder.id}) created! `)
	} catch (e: any) {
	    console.log(e.errorCode, '-', e.message)
	}
	orders.push({order: newOrder,
		     product: inventory.product,
		     listing: inventory.listing
		    })
	
    }
    return orders;
}

export async function giveRating(id: any, schema: any, orders: any) {
    let ratings: any = [];
    let price = 135000

    console.log(`\n\n✉️  Listening to Ratings \n`)

    for (let i = 0; i < NUMBER_OF_RATING; i++) {
	let order = orders[between(0, orders.length)];
	
	let ratingStream = cord.Content.fromSchemaAndContent(
	    schema,
	    order.product!.stream!.contents,
	    id.buyerOne!.address
	)
	console.log(`📧 Product Order Details `)
	console.dir(ratingStream, { depth: null, colors: true })

	let newRatingContent = cord.ContentStream.fromStreamContent(
	    ratingStream,
	    id.buyerOne!,
	    {
		link: order.order!.id,
	    }
	)
	console.log(`\n📧 Hashed Order Stream `)
	console.dir(newRatingContent, { depth: null, colors: true })

	let bytes = json.encode(newRatingContent)
	let encoded_hash = await hasher.digest(bytes)
	const ratingCid = CID.create(1, 0xb220, encoded_hash)
	let rating = between(1,5);
	let newRating = cord.Product.fromProductContentAnchor(
	    newRatingContent,
	    ratingCid.toString(),
	    order.listing!.store_id,
	    price,
	    rating
	)

	let ratingCreationExtrinsic = await newRating.order_rating()

	console.log(`\n📧 Order On-Chain Details`)
	console.dir(newRating, { depth: null, colors: true })
	console.log('\n⛓  Anchoring Product Ordering Event to the chain...')
	console.log(`🔑 Controller: ${id.buyerOne!.address} `)

	try {
	    await cord.ChainUtils.signAndSubmitTx(
		ratingCreationExtrinsic,
		id.networkAuthor!,
		{
		    resolveOn: cord.ChainUtils.IS_IN_BLOCK,
		}
	    )
	    console.log(`✅ Rating for (${newRating.id}) created! `)
	} catch (e: any) {
	    console.log(e.errorCode, '-', e.message)
	}

	ratings.push({rating: newRating})
    }
    return ratings;
}


async function main() {
    await cord.init({ address: 'wss://staging.cord.network' })

    /* Create Identities - Can have a separate registry for this */
    let id = await createIdentities();
    console.log('✅ Identities created!')
    
    // Step 2: Setup a new Product
    let { products, schema } = await registerProducts(id);
    console.log(`✅ ${products.length} Products added! `)
 
    // Step 3: Create a new Listing
    let listings = await addProductListing(id, schema, products);
    console.log(`✅ ${listings.length} products listed by seller! `)

    // Step 4: Create an Order from the lists
    let orders = await placeOrder(id, schema, listings);
    console.log(`✅ ${orders.length} orders placed! `)

    // Step 4: Create an Rating from the lists
    let ratings = await giveRating(id, schema, orders);
    console.log(`✅ ${ratings.length} rating given! `)

    await waitForEnter('\n⏎ Press Enter to continue..')
}

main()
  .then(() => console.log('\nBye! 👋 👋 👋 '))
  .finally(cord.disconnect)

process.on('SIGINT', async () => {
  console.log('\nBye! 👋 👋 👋 \n')
  cord.disconnect()
  process.exit(0)
})
