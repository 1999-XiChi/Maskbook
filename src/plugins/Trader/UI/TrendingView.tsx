import React, { useState, useEffect } from 'react'
import {
    makeStyles,
    Avatar,
    Typography,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Theme,
    createStyles,
    Link,
    Box,
    Paper,
    Tab,
    Tabs,
} from '@material-ui/core'
import { resolvePlatformName, Platform } from '../types'
import { getActivatedUI } from '../../../social-network/ui'
import { formatCurrency } from '../../Wallet/formatter'
import { useTrending } from '../hooks/useTrending'
import { TickersTable } from './TickersTable'
import { PriceChangedTable } from './PriceChangedTable'
import { PriceChanged } from './PriceChanged'
import { PriceChart } from './PriceChart'
import { getEnumAsArray } from '../../../utils/enum'
import { Linking } from './Linking'
import { usePriceStats } from '../hooks/usePriceStats'
import { Skeleton } from '@material-ui/lab'
import { PriceChartDaysControl } from './PriceChartDaysControl'
import { useCurrentPlatform } from '../hooks/useCurrentPlatform'
import { useCurrentCurrency } from '../hooks/useCurrentCurrency'
import { currentTrendingViewPlatformSettings } from '../settings'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useAvailablePlatforms } from '../hooks/useAvailablePlatforms'

const useStyles = makeStyles((theme: Theme) => {
    const internalName = getActivatedUI()?.internalName
    return createStyles({
        root: {
            width: 450,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            ...(internalName === 'twitter'
                ? {
                      boxShadow: `${
                          theme.palette.type === 'dark'
                              ? 'rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px'
                              : 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px'
                      }`,
                  }
                : null),
        },
        header: {
            display: 'flex',
            position: 'relative',
        },
        content: {
            paddingTop: 0,
            paddingBottom: 0,
        },
        footer: {
            justifyContent: 'flex-end',
        },
        tabs: {
            width: '100%',
            height: 35,
            minHeight: 'unset',
        },
        tab: {
            height: 35,
            minHeight: 'unset',
        },
        section: {},
        rank: {
            color: theme.palette.text.primary,
            fontWeight: 300,
            marginRight: theme.spacing(1),
        },
        footnote: {
            fontSize: 10,
        },
        platform: {
            cursor: 'pointer',
            marginRight: theme.spacing(0.5),
            '&:last-child': {
                marginRight: 0,
            },
        },
        avatar: {},
        percentage: {
            marginLeft: theme.spacing(1),
        },
    })
})

//#region skeleton
interface TrendingViewSkeletonProps {}

function TrendingViewSkeleton(props: TrendingViewSkeletonProps) {
    const classes = useStyles()
    return (
        <Card className={classes.root} elevation={0} component="article">
            <CardHeader
                avatar={<Skeleton animation="wave" variant="circle" width={40} height={40} />}
                title={<Skeleton animation="wave" height={10} width="30%" />}
                subheader={<Skeleton animation="wave" height={10} width="20%" />}
            />
            <CardContent className={classes.content}>
                <Skeleton animation="wave" variant="rect" height={58} style={{ marginBottom: 8 }} />
                <Skeleton animation="wave" variant="rect" height={254} />
            </CardContent>
            <CardActions className={classes.footer}>
                <Skeleton animation="wave" height={10} width="30%" />
            </CardActions>
        </Card>
    )
}
//#endregion

//#region trending view
export interface TrendingViewProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    name: string
    platforms: Platform[]
    onUpdate?: () => void
}

export function TrendingView(props: TrendingViewProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const [tabIndex, setTabIndex] = useState(0)

    //#region trending
    const platform = useCurrentPlatform(props.platforms)
    const { value: currency, loading: loadingCurrency } = useCurrentCurrency(platform)
    const { value: trending, loading: loadingTrending } = useTrending(props.name, platform, currency)
    //#endregion

    //#region stats
    const [days, setDays] = useState(365)
    const { value: stats = [], loading: loadingStats } = usePriceStats({
        coinId: trending?.coin.id,
        platform: trending?.platform,
        currency: trending?.currency,
        days,
    })
    //#endregion

    //#region api ready callback
    useEffect(() => {
        props.onUpdate?.()
    }, [tabIndex, loadingCurrency, loadingTrending])
    //#endregion

    //#region display loading skeleton
    if (loadingCurrency || loadingTrending) return <TrendingViewSkeleton />
    //#endregion
    //#region error handling
    // error: no available platform
    if (props.platforms.length === 0) return null

    // error: fail to load currency
    if (!currency) return null

    // error: unknown coin or api error
    if (!trending) return null
    //#endregion

    const { coin, market, tickers } = trending

    return (
        <Card className={classes.root} elevation={0} component="article">
            <CardHeader
                className={classes.header}
                avatar={
                    <Linking href={coin.home_url}>
                        <Avatar className={classes.avatar} src={coin.image_url} alt={coin.symbol} />
                    </Linking>
                }
                title={
                    <Box display="flex" alignItems="center">
                        <Typography variant="h6">
                            {typeof coin.market_cap_rank === 'number' ? (
                                <span className={classes.rank} title="Market Cap Rank">
                                    #{coin.market_cap_rank}
                                </span>
                            ) : null}
                            <Linking href={coin.home_url}>{coin.symbol.toUpperCase()}</Linking>
                            <span>{` / ${currency.name}`}</span>
                        </Typography>
                    </Box>
                }
                subheader={
                    <>
                        <Typography component="p" variant="body1">
                            <span>{`${currency.symbol ?? `${currency.name} `}${formatCurrency(
                                market.current_price,
                            )}`}</span>
                            {typeof market.price_change_percentage_24h === 'number' ? (
                                <PriceChanged amount={market.price_change_percentage_24h} />
                            ) : null}
                        </Typography>
                    </>
                }
                disableTypography
            />
            <CardContent className={classes.content}>
                <Paper variant="outlined">
                    <Tabs
                        className={classes.tabs}
                        textColor="primary"
                        variant="fullWidth"
                        value={tabIndex}
                        onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                        TabIndicatorProps={{
                            style: {
                                display: 'none',
                            },
                        }}>
                        <Tab className={classes.tab} label={t('plugin_trader_tab_price')}></Tab>
                        <Tab className={classes.tab} label={t('plugin_trader_tab_exchange')}></Tab>
                    </Tabs>
                    {tabIndex === 0 ? (
                        <>
                            <PriceChangedTable market={market} />
                            <PriceChart stats={stats} loading={loadingStats}>
                                <PriceChartDaysControl days={days} onDaysChange={setDays}></PriceChartDaysControl>
                            </PriceChart>
                        </>
                    ) : (
                        <TickersTable tickers={tickers} platform={platform} />
                    )}
                </Paper>
            </CardContent>
            <CardActions className={classes.footer}>
                <Typography className={classes.footnote} color="textSecondary" variant="subtitle2">
                    <span>{t('plugin_trader_tab_switch_data_source')}</span>
                    {props.platforms.map((x) => (
                        <Link
                            className={classes.platform}
                            key={x}
                            color={platform === x ? 'primary' : 'textSecondary'}
                            onClick={() => {
                                currentTrendingViewPlatformSettings.value = String(x)
                            }}>
                            {resolvePlatformName(x)}
                        </Link>
                    ))}
                </Typography>
            </CardActions>
        </Card>
    )
}
//#endregion
