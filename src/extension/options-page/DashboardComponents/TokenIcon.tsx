import React from 'react'
import { EthereumAddress } from 'wallet.ts'
import { makeStyles, createStyles, Avatar } from '@material-ui/core'
import { ETH_ADDRESS } from '../../../plugins/Wallet/token'
import { useStylesExtends } from '../../../components/custom-ui-helper'

const useStyles = makeStyles((theme) =>
    createStyles({
        coin: {
            width: 16,
            height: 16,
        },
    }),
)

export interface TokenIconProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    name?: string
    address: string
}

export function TokenIcon(props: TokenIconProps) {
    const { address, name } = props
    const classes = useStylesExtends(useStyles(), props)
    const checksumAddress = EthereumAddress.checksumAddress(address)
    return (
        <Avatar
            className={classes.coin}
            src={
                checksumAddress === ETH_ADDRESS
                    ? 'https://rawcdn.githack.com/trustwallet/assets/257c82b25e6f27ede7a2b309aadc0ed17bca45ae/blockchains/ethereum/info/logo.png'
                    : `https://rawcdn.githack.com/trustwallet/assets/257c82b25e6f27ede7a2b309aadc0ed17bca45ae/blockchains/ethereum/assets/${checksumAddress}/logo.png`
            }>
            {name?.substr(0, 1).toLocaleUpperCase()}
        </Avatar>
    )
}
