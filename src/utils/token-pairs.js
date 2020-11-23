/**
 * Class handles operations over token pairs.
 */
export class TokenPairs {
    /**
     * Get all pairs where given token occurs.
     *
     * @param {array} _pairs
     * @param {ERC20Token} _token
     * @return {[]}
     */
    static getTokenPairs(_pairs, _token) {
        const pairs = [];

        _pairs.forEach((_pair) => {
            if (TokenPairs.findToken(_pair.tokens, _token)) {
                pairs.push(_pair);
            }
        });

        return pairs;
    }

    /**
     * Get all tokens that occur in pairs.
     *
     * @param {UniswapPair[]} _pairs
     * @param {ERC20Token} _excludeToken
     * @return {[]}
     */
    static getTokensFromPairs(_pairs, _excludeToken) {
        const tokens = [];

        _pairs.forEach((_pair) => {
            _pair.tokens.forEach((_token) => {
                if (
                    !TokenPairs.findToken(tokens, _token) &&
                    (!_excludeToken || _token.address !== _excludeToken.address)
                ) {
                    tokens.push(_token);
                }
            });
        });

        return tokens;
    }

    /**
     * @param {UniswapPair[]} _pairs
     * @param {ERC20Token[]} _tokens
     * @return {object}
     */
    static getPairByTokens(_pairs, _tokens) {
        return (
            _pairs.find((_pair) => {
                const { tokens } = _pair;

                return TokenPairs.findToken(tokens, _tokens[0]) && TokenPairs.findToken(tokens, _tokens[1]);
            }) || {}
        );
    }

    /**
     * @param {UniswapPair[]} _pairs
     * @param {ERC20Token} _token
     * @return {[]}
     */
    static getDirectPaths(_pairs, _token) {
        return TokenPairs.getPaths(_pairs, _token, true);
    }

    /**
     * @param {UniswapPair[]} _pairs
     * @param {ERC20Token} _token
     * @param {boolean} [_directPath]
     * @param {array} [_path]
     * @param {ERC20Token[]} [_allTokens]
     * @return {[]}
     */
    static getPaths(_pairs, _token, _directPath = false, _path = [], _allTokens) {
        const allTokens = _allTokens || TokenPairs.getTokensFromPairs(_pairs);
        const tokenPairs = TokenPairs.getTokenPairs(_pairs, _token);
        const path = [..._path, _token];
        const paths = [];

        tokenPairs.forEach((_pair) => {
            const token = TokenPairs.getOtherToken(_pair.tokens, _token);
            let idx = -1;

            if (token) {
                idx = this.findTokenIndex(allTokens, token);
                if (idx > -1) {
                    paths.push([...path, token]);
                    allTokens.splice(idx, 1);
                }
            }
        });

        if (!_directPath && allTokens.length > 0) {
            console.log(allTokens.length);
            /*
            for (let i = 0, len1 = paths.length; i < len1; i++) {
                if (allTokens.length === 0) {
                    break;
                }
            }
            */
        }

        return paths;
    }

    /**
     * Get the other token from pair.
     *
     * @param {ERC20Token[]} _tokens
     * @param {ERC20Token} _token
     * @return {ERC20Token|undefined}
     */
    static getOtherToken(_tokens, _token) {
        return _tokens.find((_item) => _item.address !== _token.address);
    }

    /**
     * @param {ERC20Token[]} _tokens
     * @return {string[]}
     */
    static getAddresses(_tokens) {
        return _tokens.map((_token) => _token.address);
    }

    /**
     * @param {UniswapPair[]} _pairs
     * @return {[]}
     */
    static getPairAddresses(_pairs) {
        return _pairs.map((_pair) => _pair.pairAddress);
    }

    /**
     * @param {array} _array
     * @param {ERC20Token} _token
     * @return {number|undefined}
     */
    static findTokenIndex(_array, _token) {
        return _array ? _array.findIndex((_item) => _item.address === _token.address) : undefined;
    }

    /**
     * @param {array} _array
     * @param {ERC20Token} _token
     * @return {ERC20Token|undefined}
     */
    static findToken(_array, _token) {
        return _array ? _array.find((_item) => _item.address === _token.address) : undefined;
    }

    /**
     * @param {UniswapPair} _pair
     * @param {ERC20Token} _token
     * @return {ERC20Token|undefined}
     */
    static findPairToken(_pair, _token) {
        return TokenPairs.findToken(_pair ? _pair.tokens : null, _token);
    }

    /**
     * @param {array} _array
     * @param {string} _tokenSymbol
     * @return {ERC20Token|undefined}
     */
    static findTokenBySymbol(_array, _tokenSymbol) {
        return _array ? _array.find((_item) => _item.symbol === _tokenSymbol) : undefined;
    }
}
