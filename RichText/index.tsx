import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';
import { useEffect, useState } from 'react';
type EditorProps = {
  content: string;
  change: (html: string) => void;
};
export default (props: EditorProps) => {
  const [editorState, setEditorState] = useState<any>(null);
  useEffect(() => {
    setEditorState(BraftEditor.createEditorState(props.content));
  }, []);
  const handleEditorChange = (obj: any) => {
    props.change(obj.toHTML());
    setEditorState(obj);
  };
  const myUploadFn = (param: any) => {
    const serverURL = BASE_REQUEST_URL + '/common/upload';
    const xhr = new XMLHttpRequest();
    const fd = new FormData();

    const successFn = () => {
      // 假设服务端直接返回文件上传后的地址
      // 上传成功后调用param.success并传入上传后的文件地址
      const response = JSON.parse(xhr.responseText);
      param.success({
        url: response.url,
        meta: {
          title: response.newFileName,
          alt: 'xxx',
          loop: true, // 指定音视频是否循环播放
          autoPlay: true, // 指定音视频是否自动播放
          controls: true, // 指定音视频是否显示控制栏
        },
      });
    };

    const progressFn = (event: any) => {
      // 上传进度发生变化时调用param.progress
      param.progress((event.loaded / event.total) * 100);
    };

    const errorFn = () => {
      // 上传发生错误时调用param.error
      param.error({
        msg: 'unable to upload.',
      });
    };

    xhr.upload.addEventListener('progress', progressFn, false);
    xhr.addEventListener('load', successFn, false);
    xhr.addEventListener('error', errorFn, false);
    xhr.addEventListener('abort', errorFn, false);

    fd.append('file', param.file);
    xhr.open('POST', serverURL, true);
    xhr.send(fd);
  };
  return (
    <div className="my-component">
      <BraftEditor
        value={editorState}
        onChange={handleEditorChange}
        media={{ uploadFn: myUploadFn }}
      />
    </div>
  );
};
