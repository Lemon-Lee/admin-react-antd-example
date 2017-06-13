import React, {Component} from 'react'
import {Table, Button, Spin, Popconfirm, Input} from 'antd'
import {createStore} from 'redux'
import {Provider, connect} from 'react-redux'
import { apiPost } from '../../../api'
// 引入组件
import Addupkeep from './AddUpkeep'
// Reducer
function reducer (state, action) {
    switch (action.type) {
        case 'update':
            return Object.assign({}, state, {
                id: action.payload
            })
        default:
            return {
                count: action.payload,
                id: 0
            }
    }
}
// Store
const store = createStore(reducer, {
    count: [],
    id: ''
})

// React component
class Counter extends Component {
    state = {
        loading: false,
        open: false,
        id: 0
    }

    async initialRemarks () {
        this.setState({loading: true})
        let result = await apiPost(
            'http://192.168.1.108:18082/upkeep/list'
        )
        this.setState({loading: false})
        this.props.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            payload: result.data
        })
    }
    componentDidMount () {
        this.initialRemarks()
    }
    componentWillReceiveProps (nextProps) {
        if (nextProps.id !== 0) {
            this.setState({open: true,
                id: nextProps.id})
        }
    }
    refresh = async () => {
        // 刷新表格
        this.setState({
            loading: true,
            open: false,
            id: 0
        })
        let result = await apiPost(
            'http://192.168.1.108:18082/upkeep/list',
            {'entryName': this.entryName}
        )
        this.setState({loading: false})
        this.props.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            payload: result.data
        })
    }
    // 弹出框设置
    showModal = () => {
        this.setState({open: true,
            id: 'add'})
    }
    entryName = ''
    entryNameOnChange = (e) => {
        this.entryName = e.target.value
    }
    query = () => {
        this.refresh()
    }
    render () {
        const {products, columns} = this.props
        let title
        if (this.state.id > 0) {
            title = '收费项修改'
        } else {
            title = '添加收费项'
        }
        return (
            <div>
                <Addupkeep
                    title={title}
                    id={this.state.id}
                    refreshTable={this.refresh}
                    visible={this.state.open}
                />
                <span>
                    <span>物品名称:</span>
                <Input style={{width: 200}} onChange={this.entryNameOnChange}/>
                <Button type="primary" onClick={this.query}>查询</Button>
                <Button type="primary" onClick={this.showModal}>增加收费项</Button>
                </span>
                <Spin spinning={this.state.loading}>
                    <Table
                        dataSource={products}
                        columns={columns}
                    />
                </Spin>
            </div>
        )
    }
}


// Action


// Map Redux state to component props
function mapStateToProps (state, ownProps) {
    return {
        id: state.id,
        products: state.count
    }
}

function mapDispatchToProps (dispatch) {
    async function handleDelete (id) {
        let result = await apiPost(
            'http://192.168.1.108:18082/upkeep/delect',
            { 'id': id }
        )
        dispatch({
            type: 'SET_VISIBILITY_FILTER',
            payload: result.data
        })
    }

    function handleUpdate (id) {
        dispatch({
            type: 'update',
            payload: id
        })
    }

    return {
        dispatch: dispatch,
        columns: [{
            title: '序号',
            dataIndex: 'id',
            key: 'id'
        }, {
            title: '物品名称',
            dataIndex: 'entryName',
            key: 'entryName'
        }, {
            title: '单位',
            dataIndex: 'company',
            key: 'company'
        }, {
            title: '进货价格',
            dataIndex: 'purchasePrice',
            key: 'purchasePrice'
        }, {
            title: '服务费',
            dataIndex: 'serviceCharge',
            key: 'serviceCharge'
        }, {
            title: '收费',
            dataIndex: 'tollAmount',
            key: 'tollAmount'
        }, {
            title: '操作',
            dataIndex: 'opt',
            key: 'opt',
            render: function (text, record, index) {
                return (
                    <div>
                        <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(record.id)}>
                            <Button >删除</Button>
                        </Popconfirm>
                        <Popconfirm title="确定修改吗?" onConfirm={() => handleUpdate(record.id)}>
                            <Button >修改</Button>
                        </Popconfirm>
                    </div>
                )
            }
        }]
    }
}
// Connected Component
const App = connect(
    mapStateToProps,
    mapDispatchToProps
)(Counter)


class index extends Component {
    render () {
        return (
            <Provider store={store}>
                <App />
            </Provider>
        )
    }
}

export default index

