import RichText from '@/components/RichText';
import { getImgSrc } from '@/utils/common';
import {
  ModalForm,
  ProForm,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { ProFormSwitch } from '@ant-design/pro-form';
import { message } from 'antd';
import { ReactNode, useEffect, useState } from 'react';

type PropsT = {
  labelCol?: number; // label宽度，默认3
  formKey: number; // 表单Key，用于重置
  title: string;
  onFinish: (value: any) => Promise<void>;
  initialValues: {
    [k: string]: string | number;
  }; // 初始默认数据
  columns: {
    title: string;
    dataIndex: string;
    require: boolean;
    valueType: string;
    showInModal?: boolean;
    disabled?: boolean;
    valueEnum?: {
      // 下拉选择内容
      [k: string | number]: {
        text: string;
      };
    };
    request?: () => Promise<
      {
        label: string;
        value: string | number;
      }[]
    >;
    editType?: string; // 在弹窗中的表现形式，如 radio,select,textarea
    addOnBefore?: ReactNode;
    addOnAfter?: ReactNode;
  }[];
  slot?: {
    [k: string]: ReactNode;
  }; // 如果不满足，可自定义内容，K为对应key
  extraSlot?: ReactNode; // 额外的内容
};
export default function Index(props: PropsT) {
  const [visible, setVisible] = useState(false);
  const [initDatas, setInitDatas] = useState({});
  const [formKey, setFormKey] = useState<number>(0);
  const [richTextKey, setRichTextKey] = useState('');
  const [richText, setRichText] = useState('');
  const [uploadKey, setUploadKey] = useState('');

  useEffect(() => {
    if (props.formKey > 0) {
      let data = { ...props.initialValues };
      const richTextArr = props.columns.filter((item) => item.editType === 'richText');
      const uploadArr = props.columns.filter((item) => item.editType === 'upload');

      if (richTextArr.length > 0) {
        // 设置富文本初始内容
        const _richText = Reflect.get(props.initialValues, richTextArr[0].dataIndex);
        setRichText(_richText as string);
        setRichTextKey(richTextArr[0].dataIndex);
      }
      if (uploadArr.length > 0) {
        setUploadKey(uploadArr[0].dataIndex);
        const _images = Reflect.get(props.initialValues, uploadArr[0].dataIndex) as string;
        if (_images) {
          // 转换接口返回数据为组件数据
          const _image = _images.split(',').map((item: string, index: number) => {
            return {
              url: getImgSrc(item),
              uid: `${index}`,
              name: `banner${index + 1}.png`,
              status: 'done',
            };
          });
          Reflect.set(data, uploadArr[0].dataIndex, _image);
        } else {
          // 此处必须设置为null，不然空字符串会引发组件错误
          Reflect.set(data, uploadArr[0].dataIndex, null);
        }
      }
      setInitDatas(data);
      setFormKey(formKey + 1); // 强制更新
      setVisible(true);
    }
  }, [props.formKey]);
  return (
    <ModalForm
      labelCol={{ span: props.labelCol || 3 }}
      key={formKey}
      title={props.title}
      layout={'horizontal'}
      grid={true}
      open={visible}
      onOpenChange={setVisible}
      onFinish={async (value) => {
        const extra = {};
        if (uploadKey) {
          Reflect.set(
            extra,
            uploadKey,
            value[uploadKey].map((item: any) => item.url || item.response.url).join(','),
          );
          Reflect.deleteProperty(value, uploadKey);
        }
        if (richTextKey) {
          Reflect.set(extra, richTextKey, richText);
        }
        await props.onFinish({
          ...value,
          ...extra,
        });
        message.success(props.title + '成功！');
        setVisible(false);
      }}
      initialValues={initDatas}
    >
      <ProForm.Group>
        {props.columns
          .filter((item) => item.showInModal)
          .map((item) => {
            if (props.slot && Reflect.has(props.slot, item.dataIndex)) {
              return Reflect.get(props.slot, item.dataIndex);
            }
            if (item.editType) {
              let options: {
                label: string;
                value: number | string;
              }[] = [];
              if (item.valueEnum) {
                const valueEnum = item.valueEnum;
                options = Object.keys(valueEnum).map((k) => {
                  return {
                    label: valueEnum[k].text,
                    value: +k,
                  };
                });
              }
              switch (item.editType) {
                case 'radio':
                  return (
                    <ProFormRadio.Group
                      addonBefore={item.addOnBefore}
                      addonAfter={item.addOnAfter}
                      key={item.dataIndex}
                      name={item.dataIndex}
                      label={item.title}
                      rules={[{ required: item.require }]}
                      options={options}
                      fieldProps={{
                        optionType: 'button',
                        buttonStyle: 'solid',
                      }}
                    />
                  );
                case 'textarea':
                  return (
                    <ProFormTextArea
                      width="md"
                      addonBefore={item.addOnBefore}
                      addonAfter={item.addOnAfter}
                      key={item.dataIndex}
                      name={item.dataIndex}
                      label={item.title}
                      rules={[{ required: item.require }]}
                    />
                  );
                case 'select':
                  return (
                    <ProFormSelect
                      width="md"
                      addonBefore={item.addOnBefore}
                      addonAfter={item.addOnAfter}
                      key={item.dataIndex}
                      name={item.dataIndex}
                      label={item.title}
                      rules={[{ required: item.require }]}
                      request={item.request}
                      options={options}
                    />
                  );
                case 'digit':
                  return (
                    <ProFormDigit
                      width="md"
                      addonBefore={item.addOnBefore}
                      addonAfter={item.addOnAfter}
                      key={item.dataIndex}
                      name={item.dataIndex}
                      label={item.title}
                      rules={[{ required: item.require }]}
                    />
                  );
                case 'switch':
                  return (
                    <ProFormSwitch
                      addonBefore={item.addOnBefore}
                      addonAfter={item.addOnAfter}
                      key={item.dataIndex}
                      name={item.dataIndex}
                      label={item.title}
                      rules={[{ required: item.require }]}
                    />
                  );
                case 'upload':
                  return (
                    <ProFormUploadButton
                      accept={'.png,.jpg,.jpeg'}
                      extra="请上传 大小不超过 5MB 格式为 png/jpg/jpeg 的文件"
                      max={1}
                      listType="picture-card"
                      key={item.dataIndex}
                      name={item.dataIndex}
                      label={item.title}
                      rules={[{ required: item.require }]}
                      action={BASE_REQUEST_URL + '/common/upload'}
                    />
                  );
                case 'richText':
                  return (
                    <div
                      key={richTextKey}
                      style={{
                        display: 'flex',
                        marginBottom: '24px',
                      }}
                    >
                      <div
                        style={{
                          width: '12.5%',
                          textAlign: 'right',
                        }}
                      >
                        文章内容：
                      </div>
                      <div
                        style={{
                          flex: 1,
                          border: '1px solid #ccc',
                        }}
                      >
                        <RichText content={richText} change={setRichText} />
                      </div>
                    </div>
                  );
              }
            }
            return (
              <ProFormText
                disabled={item.disabled}
                width="md"
                addonBefore={item.addOnBefore}
                addonAfter={item.addOnAfter}
                key={item.dataIndex}
                name={item.dataIndex}
                label={item.title}
                rules={[{ required: item.require }]}
              />
            );
          })}
        {props.extraSlot}
      </ProForm.Group>
    </ModalForm>
  );
}
