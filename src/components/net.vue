<template>
    <div>
        <el-collapse>
            <el-collapse-item title="E大网格交易法 的辅助计算工具" name="1">
                <div class="text">
                    <div class="text_section">
                        <p>本工具是基于E大网格交易的策略，所制作的辅助计算程序，可根据自己的价格、资金生成表格供参考</p>
                        <p>策略具体是指以下两篇文章，使用前请仔细研读E大的思路:</p>
                        <p><a href="https://mp.weixin.qq.com/s/-czfqGvxkDcay_tSI1jv5g" target="_blank">波段策略.网格之二：网格策略基础/1.0版</a></p>
                        <p><a href="https://mp.weixin.qq.com/s/8pRKsjiQSZzrmH-uWCkRLQ" target="_blank">波段策略.网格之三：网格策略进阶/2.0版</a></p>
                    </div>
                    <div class="text_section">
                        <p>以下为工具的参数解释：</p>
                        <p>买入价: 为设置档位的买入价格，需根据基金的价格和档位自行判断设置</p>
                        <p>档位: 买入价格对应的档位，这里初始档位为100，若设置其他的数值，会向上计算到100。</p>
                        <p>数据行: 当档位为100时可以设置向下计算的数据行数，当档位非100时不会向下计算，此项无意义隐藏</p>
                        <p>一档买入金额: 100档位买入的总资金，也是每次交易的资金，会根据子策略2变化</p>
                        <p>其他参数则基本和文章里的概念一致</p>
                    </div>
                    <div class="text_section">
                        <p>使用参考：</p>
                        <p>实际情况可能是这样：我们先确定交易品种，然后根据其历史价格确定第一档位，或者确定当前是哪个档位</p>
                        <p>那么基本只要修改买入价、档位、一档买入金额这三项数据，然后点击计算生成表格</p>
                    </div>
                    <div class="text_section">
                        <p>若有错误，请予指正</p>
                    </div>
                </div>
            </el-collapse-item>
        </el-collapse>

        <el-form class="base_box" size="mini" label-width="150px" :inline="true">
            <el-form-item label="买入价">
                <el-input v-model.number="buyPrice" type="number" />
            </el-form-item>
            <el-form-item label="档位，单位%">
                <el-input v-model.number="gear" type="number" />
            </el-form-item>
            <el-form-item :style="{ visibility: gear === 100 ? 'visible' : 'hidden' }" label="数据行">
                <el-input v-model.number="line" type="number" />
            </el-form-item>
            <el-form-item label="一档买入金额">
                <el-input v-model.number="buyCount" type="number" />
            </el-form-item>
            <el-form-item label="小网，单位%">
                <el-input v-model.number="smallNet" type="number" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="showTable">计算</el-button>
            </el-form-item>
        </el-form>

        <div class="flex_box">
            <div class="strategy">
                <div class="strategy_title">
                    <span>子策略一 留利润</span>
                    <el-checkbox v-model="keepStrategy" style="margin-left: 15px;" @change="v => multiple = v ? 1 : 0" />
                </div>
                <div v-if="keepStrategy" label-width="100px" size="mini">
                    <span>留利率倍数</span>
                    <el-input v-model.number="multiple" class="input" size="mini" type="number" />
                </div>
            </div>
            <div class="strategy">
                <div class="strategy_title">
                    <span>子策略二 逐格加码</span>
                    <el-checkbox v-model="overchargeStrategy" style="margin-left: 15px;" @change="v => overcharge = v ? 5 : 0" />
                </div>
                <div v-if="overchargeStrategy" label-width="100px" size="mini">
                    <span>逐格加码率，单位%</span>
                    <el-input v-model.number="overcharge" class="input" size="mini" type="number" />
                </div>
            </div>
            <div class="strategy">
                <div class="strategy_title">
                    <span>子策略三 一网打尽</span>
                    <el-checkbox v-model="netStrategy" style="margin-left: 15px;" />
                </div>
                <div v-if="netStrategy" label-width="100px" size="mini">
                    <div>
                        <span>中网，单位%</span>
                        <el-input v-model.number="middleNet" class="input" size="mini" type="number" />
                    </div>
                    <div style="margin-top: 10px;">
                        <span>大网，单位%</span>
                        <el-input v-model.number="largeNet" class="input" size="mini" type="number" />
                    </div>
                </div>
            </div>
        </div>

        <el-table class="table" :data="list" :span-method="objectSpanMethod" border>
            <el-table-column
                v-for="{ prop, label } in tableConfig"
                :key="prop"
                :prop="prop"
                :label="label"
                align="center"
            />
        </el-table>
    </div>
</template>

<script>

function fixed(num, n) {
    const ratio = 10 ** n
    return Math.round(num * ratio) / ratio
}

export default {
    data() {
        return {
            buyPrice: 1,
            gear: 100,
            multiple: 1,
            overcharge: 5,
            buyCount: 10000,
            list: [],
            tableConfig: [
                { prop: 'type', label: '网格类型' },
                { prop: 'gear', label: '档位' },
                { prop: 'buyPrice', label: '买入价' },
                { prop: 'sellPrice', label: '卖出价' },
                { prop: 'buyNum', label: '买入数量' },
                { prop: 'buyCount', label: '买入金额' },
                { prop: 'sellNum', label: '卖出数量' },
                { prop: 'sellCount', label: '卖出金额' },
                { prop: 'keepNum', label: '留存数量' },
                { prop: 'keepCount', label: '留存金额' },
                { prop: 'profitPercentage', label: '盈利比例' },
                { prop: 'profitCount', label: '本期盈利金额' },
            ],
            line: 10,
            smallNet: 5,
            middleNet: 15,
            largeNet: 30,
            keepStrategy: true,
            overchargeStrategy: true,
            netStrategy: true,
        }
    },
    computed: {
        len() {
            const smallNetList = this.list.filter(i => i.type === '小网')
            const middleNetList = this.list.filter(i => i.type === '中网')
            const largeNetList = this.list.filter(i => i.type === '大网')
            return {
                small: smallNetList.length,
                middle: middleNetList.length,
                large: largeNetList.length,
            }
        },
    },
    methods: {
        showTable() {
            this.list = []
            const smallList = this.getPercentageList(this.smallNet, '小网', this.line)
            if (this.netStrategy) {
                const middleList = this.getPercentageList(this.middleNet, '中网', Math.floor(100 / this.middleNet))
                const largeList = this.getPercentageList(this.largeNet, '大网', Math.floor(100 / this.largeNet))
                middleList.shift()
                largeList.shift()
                this.list = [
                    ...smallList,
                    ...middleList,
                    ...largeList,
                ]
            } else {
                this.list = smallList
            }
        },
        getPercentageList(percentage, type, line) {
            const list = []
            if ((100 - this.gear) % percentage !== 0) {
                this.$message({
                    showClose: true,
                    message: type + '档位不符合',
                    type: 'warning'
                });
            }
            const len = (100 - this.gear) / percentage || line
            for (let i = 0; i <= len; i++) {
                const gear = 100 - i * percentage
                const buyPriceRatio = (1 - i * percentage / 100)
                list.push({
                    gear,
                    buyPriceRatio,
                    sellPriceRatio: fixed(buyPriceRatio + percentage / 100, 2),
                    buyNum: 1,
                })
            }
            const item = list.find(i => i.gear === this.gear) || {}
            const ratio = this.buyPrice / item.buyPriceRatio
            return list.map((item, i) => {
                const buyPrice = fixed(ratio * item.buyPriceRatio, 3)
                const sellPrice = fixed(ratio * item.sellPriceRatio, 3)
                const buyCount = this.buyCount * (1 + this.overcharge * i / 100)
                const buyNum = Math.ceil(buyCount / buyPrice)
                const magnification = (item.gear + percentage) / item.gear
                const profit = buyNum * buyPrice * (magnification - 1)
                const keepCount = profit * this.multiple
                const sellNum = Math.ceil(buyNum - keepCount / sellPrice)
                const keepNum = buyNum - sellNum
                return {
                    ...item,
                    type,
                    buyPrice,
                    sellPrice,
                    buyNum,
                    buyCount: fixed(buyNum * buyPrice, 2), // 金额由整数量再计算
                    sellNum,
                    sellCount: fixed(sellNum * sellPrice, 2),
                    keepNum,
                    keepCount: fixed(keepNum * sellPrice, 2),
                    profitPercentage: `${(magnification * 100 - 100).toFixed(2)}%`,
                    profitCount: fixed(profit, 2),
                }
            })
        },
        objectSpanMethod({ row, rowIndex, columnIndex }) {
            if (columnIndex === 0) {
                if (row.type === '小网') {
                    return rowIndex === 0 ? [this.len.small, 1] : [0, 0]
                }
                if (row.type === '中网') {
                    return rowIndex === this.len.small ? [this.len.middle, 1] : [0, 0]
                }
                if (row.type === '大网') {
                    return rowIndex === this.len.small + this.len.middle ? [this.len.large, 1] : [0, 0]
                }
            }
        },
    },
}

</script>

<style scoped>
.flex_box {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}
.strategy {
    padding: 10px;
    border: 1px solid #f5f5f5;
    margin: 10px;
    min-width: 300px;
    flex: 1;
    font-size: 13px;
}
.strategy_title {
    margin: 10px 0;
    font-size: 14px;
}
.input {
    width: auto;
    margin-left: 10px;
}
.table {
    margin-top: 10px;
    margin-bottom: 30px;
}
.base_box {
    margin-top: 20px;
    padding-top: 15px;
    background: #DCDFE6;
}
.text {
    text-align: left;
}
.text_section:not(:last-child){
    margin-bottom: 15px;
}
.text_section p {
    margin: 2px
}
</style>
