/* eslint-disable prefer-const */
import { ONE_BD, ZERO_BD, ZERO_BI, Q192, NATIVE, DAI, USDC, USDT, WHITELIST_TOKENS, DAI_WNATIVE_POOL, USDC_WNATIVE_POOL, USDT_WNATIVE_POOL } from 'const'
import { Bundle, Pool, Token } from '../types/schema'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { exponentToBigDecimal, safeDiv } from './index'

let MINIMUM_ETH_LOCKED = BigDecimal.fromString('52')

export function sqrtPriceX96ToTokenPrices(sqrtPriceX96: BigInt, token0: Token, token1: Token): BigDecimal[] {
  let num = sqrtPriceX96.times(sqrtPriceX96).toBigDecimal()
  let denom = BigDecimal.fromString(Q192.toString())
  let price1 = num
    .div(denom)
    .times(exponentToBigDecimal(token0.decimals))
    .div(exponentToBigDecimal(token1.decimals))

  let price0 = safeDiv(BigDecimal.fromString('1'), price1)
  return [price0, price1]
}

export function getEthPriceInUSD(): BigDecimal {
  // fetch native token prices for each stablecoin
  const daiPool = Pool.load(DAI_WNATIVE_POOL)
  const usdcPool = Pool.load(USDC_WNATIVE_POOL) 
  const usdtPool = Pool.load(USDT_WNATIVE_POOL)

  if (daiPool !== null && daiPool.liquidity.gt(ZERO_BI) &&
    usdcPool !== null && usdcPool.liquidity.gt(ZERO_BI) &&
    usdtPool !== null && usdtPool.liquidity.gt(ZERO_BI) 
  ) {
    const isDaiFirst = daiPool.token0 == DAI;
    const isUsdcFirst = usdcPool.token0 == USDC;
    const isUsdtFirst = usdtPool.token0 == USDT;

    const daiPoolNative = !isDaiFirst ? daiPool.totalValueLockedToken0 : daiPool.totalValueLockedToken1;
    const usdcPoolNative = !isUsdcFirst ? usdcPool.totalValueLockedToken0 : usdcPool.totalValueLockedToken1;
    const usdtPoolNative = !isUsdtFirst ? usdtPool.totalValueLockedToken0 : usdtPool.totalValueLockedToken1;
    const totalLiquidity = daiPoolNative.plus(usdcPoolNative).plus(usdtPoolNative);

    const daiWeight = !isDaiFirst
      ? daiPool.totalValueLockedToken0.div(totalLiquidity)
      : daiPool.totalValueLockedToken1.div(totalLiquidity);
    const usdcWeight = !isUsdcFirst
      ? usdcPool.totalValueLockedToken0.div(totalLiquidity)
      : usdcPool.totalValueLockedToken1.div(totalLiquidity);
    const usdtWeight = !isUsdtFirst
      ? usdtPool.totalValueLockedToken0.div(totalLiquidity)
      : usdtPool.totalValueLockedToken1.div(totalLiquidity);

    const daiPrice = isDaiFirst ? daiPool.token0Price : daiPool.token1Price;
    const usdcPrice = isUsdcFirst ? usdcPool.token0Price : usdcPool.token1Price;
    const usdtPrice = isUsdtFirst ? usdtPool.token0Price : usdtPool.token1Price;

    return daiPrice.times(daiWeight)
      .plus(usdcPrice.times(usdcWeight))
      .plus(usdtPrice.times(usdtWeight));
    // dai and USDC have been created
  } else if (daiPool !== null && daiPool.liquidity.gt(ZERO_BI) &&
    usdcPool !== null && usdcPool.liquidity.gt(ZERO_BI)
  ) {
    const isDaiFirst = daiPool.token0 == DAI;
    const isUsdcFirst = usdcPool.token0 == USDC;

    const daiPoolNative = !isDaiFirst ? daiPool.totalValueLockedToken0 : daiPool.totalValueLockedToken1;
    const usdcPoolNative = !isUsdcFirst ? usdcPool.totalValueLockedToken0 : usdcPool.totalValueLockedToken1;
    const totalLiquidity = daiPoolNative.plus(usdcPoolNative);

    const daiWeight = !isDaiFirst
      ? daiPool.totalValueLockedToken0.div(totalLiquidity)
      : daiPool.totalValueLockedToken1.div(totalLiquidity);
    const usdcWeight = !isUsdcFirst
      ? usdcPool.totalValueLockedToken0.div(totalLiquidity)
      : usdcPool.totalValueLockedToken1.div(totalLiquidity);

    const daiPrice = isDaiFirst ? daiPool.token0Price : daiPool.token1Price;
    const usdcPrice = isUsdcFirst ? usdcPool.token0Price : usdcPool.token1Price;

    return daiPrice.times(daiWeight)
      .plus(usdcPrice.times(usdcWeight));
    // USDC is the only pair so far
  } else if (daiPool !== null && daiPool.liquidity.gt(ZERO_BI)) {
    const isDaiFirst = daiPool.token0 == USDT;
    return isDaiFirst ? daiPool.token0Price : daiPool.token1Price;
  } else if (usdcPool !== null && usdcPool.liquidity.gt(ZERO_BI)) {
    const isUsdcFirst = usdcPool.token0 == USDC;
    return isUsdcFirst ? usdcPool.token0Price : usdcPool.token1Price;
  } else if (usdtPool !== null && usdtPool.liquidity.gt(ZERO_BI)) {
    const isUsdtFirst = usdtPool.token0 == USDT;
    return isUsdtFirst ? usdtPool.token0Price : usdtPool.token1Price;
  } else {
    return ZERO_BD
  }
}

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == NATIVE) {
    return ONE_BD
  }
  let whiteList = token.whitelistPools
  // for now just take USD from pool with greatest TVL
  // need to update this to actually detect best rate based on liquidity distribution
  let largestLiquidityETH = ZERO_BD
  let priceSoFar = ZERO_BD
  for (let i = 0; i < whiteList.length; ++i) {
    let poolAddress = whiteList[i]
    let pool = Pool.load(poolAddress)
    if (pool.liquidity.gt(ZERO_BI)) {
      if (pool.token0 == token.id) {
        // whitelist token is token1
        let token1 = Token.load(pool.token1)
        // get the derived ETH in pool
        let ethLocked = pool.totalValueLockedToken1.times(token1.derivedETH)
        if (ethLocked.gt(largestLiquidityETH) && ethLocked.gt(MINIMUM_ETH_LOCKED)) {
          largestLiquidityETH = ethLocked
          // token1 per our token * Eth per token1
          priceSoFar = pool.token1Price.times(token1.derivedETH as BigDecimal)
        }
      } else if (pool.token1 == token.id) {
        let token0 = Token.load(pool.token0)
        // get the derived ETH in pool
        let ethLocked = pool.totalValueLockedToken0.times(token0.derivedETH)
        if (ethLocked.gt(largestLiquidityETH) && ethLocked.gt(MINIMUM_ETH_LOCKED)) {
          largestLiquidityETH = ethLocked
          // token0 per our token * ETH per token0
          priceSoFar = pool.token0Price.times(token0.derivedETH as BigDecimal)
        }
      }
    }
  }
  return priceSoFar // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedAmountUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0USD = token0.derivedETH.times(bundle.ethPriceUSD)
  let price1USD = token1.derivedETH.times(bundle.ethPriceUSD)

  // both are whitelist tokens, return sum of both amounts
  if (WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount0.times(price0USD).plus(tokenAmount1.times(price1USD))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST_TOKENS.includes(token0.id) && !WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount0.times(price0USD).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount1.times(price1USD).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked amount is 0
  return ZERO_BD
}
