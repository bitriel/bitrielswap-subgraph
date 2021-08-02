import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export const NULL_CALL_RESULT_VALUE =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const Q192 = 2 ** 192;

export const ZERO_BD = BigDecimal.fromString("0");

export const ONE_BD = BigDecimal.fromString("1");

export const BD_1E6 = BigDecimal.fromString("1e6");

export const BD_1E12 = BigDecimal.fromString("1e12");

export const BD_1E18 = BigDecimal.fromString("1e18");

export const ZERO_BI = BigInt.fromI32(0);

export const ONE_BI = BigInt.fromI32(1);

export const BI_18 = BigInt.fromI32(18);

export const BI_ONE_HUNDRED = BigInt.fromI32(100);

export const BI_ONE_DAY_SECONDS = BigInt.fromI32(86400);

export const FACTORY_ADDRESS = "{{ factory_address }}{{^factory_address}}0x0000000000000000000000000000000000000000{{/factory_address}}";

export const SEL_TOKEN_ADDRESS = "{{ sel_token_address }}{{^sel_token_address}}0x0000000000000000000000000000000000000000{{/sel_token_address}}";

export const SEL_WNATIVE_POOL = "{{ sel_wnative_pool }}{{^sel_wnative_pool}}0x0000000000000000000000000000000000000000{{/sel_wnative_pool}}";

export const DAI_WNATIVE_POOL = "{{ dai_wnative_pool }}{{^dai_wnative_pool}}0x0000000000000000000000000000000000000000{{/dai_wnative_pool}}";

export const USDT_WNATIVE_POOL = "{{ usdt_wnative_pool }}{{^usdt_wnative_pool}}0x0000000000000000000000000000000000000000{{/usdt_wnative_pool}}";

export const BUSD_WNATIVE_POOL = "{{ busd_wnative_pool }}{{^busd_wnative_pool}}0x0000000000000000000000000000000000000000{{/busd_wnative_pool}}";

export const USDC_WNATIVE_POOL = "{{ usdc_wnative_pool }}{{^usdc_wnative_pool}}0x0000000000000000000000000000000000000000{{/usdc_wnative_pool}}";

// minimum liquidity required to count towards tracked volume for pools with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_POOLS = BigDecimal.fromString(
  "{{ minimum_usd_threshold_new_pools }}{{^minimum_usd_threshold_new_pools}}3000{{/minimum_usd_threshold_new_pools}}"
);

// minimum liquidity for price to get tracked
export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString(
  "{{ minimum_liquidity_threshold_eth }}"
);

export const WETH_ADDRESS = "{{ weth_address }}{{^weth_address}}0x0000000000000000000000000000000000000000{{/weth_address}}";

export const WNATIVE_ADDRESS = "{{ wnative_address }}{{^wnative_address}}0x0000000000000000000000000000000000000000{{/wnative_address}}";

export const NATIVE = "{{ native_address }}{{^native_address}}0x0000000000000000000000000000000000000000{{/native_address}}";

export const USDC = "{{ usdc_address }}{{^usdc_address}}0x0000000000000000000000000000000000000000{{/usdc_address}}";

export const USDT = "{{ usdt_address }}{{^usdt_address}}0x0000000000000000000000000000000000000000{{/usdt_address}}";

export const DAI = "{{ dai_address }}{{^dai_address}}0x0000000000000000000000000000000000000000{{/dai_address}}";

export const WHITELIST_TOKENS: string[] = "{{ whitelist_tokens }}".split(",");