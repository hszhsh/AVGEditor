import * as React from "react";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, Button } from 'antd';
const { confirm } = Modal;

export function showDeleteConfirm(title: string, onOK: () => void, description: string = "") {
    confirm({
        title: title,
        icon: <ExclamationCircleOutlined />,
        okText: '确定',
        // okType: 'danger',
        cancelText: '取消',
        content: description,
        onOk: onOK
    });
}