import React, { useState, useRef } from "react";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, theme, Form, Input, Row, Col } from "antd";
import type { FormProps } from "antd";

import { MessageContent } from "@langchain/core/messages";

import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { useForm } from "antd/es/form/Form";
import useAutoScroll from "./hook/useAutoScroll";
// import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";

const { Header, Sider, Content } = Layout;

type FieldType = {
  message?: string;
};

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0,
  maxRetries: 2,
  // other params...
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  cache: true,
});

interface SSEComponentProps {
  sseUrl: string;
}

const SSEComponent: React.FC<SSEComponentProps> = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    {
      dt: string;
      message: string;
      result: string;
    }[]
  >([]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useAutoScroll(scrollRef.current, messages);

  const [form] = useForm<FieldType>();

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  async function getChat(input: string) {
    setLoading(true);
    const datetime = new Date();

    const aiMsg = await llm.stream(input);

    const chunks: MessageContent[] = [];
    const prevData = messages;

    for await (const chunk of aiMsg) {
      chunks.push(chunk.content);
      setMessages([
        ...prevData,
        {
          dt: datetime.toISOString(),
          message: input,
          result: chunks.join(""),
        },
      ]);
    }
    setLoading(false);
  }

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    console.log("Success:", values);
    if (values.message) {
      getChat(values.message ?? "");
    }
    form.setFieldValue("message", undefined);
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            {
              key: "1",
              label: "nav 1",
            },
          ]}
        />
      </Sider>
      <Layout style={{ height: "100vh" }}>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Row gutter={[12, 12]} style={{ height: "100%" }}>
            <Col span={24} style={{ height: "90%", overflow: "auto" }}>
              {messages.map((message, index) => {
                return (
                  <div key={message.dt}>
                    <Markdown rehypePlugins={[rehypeHighlight]}>
                      {message.result}
                    </Markdown>
                  </div>
                );
              })}
              <div ref={scrollRef}></div>
            </Col>
            <Col span={24}>
              <Form
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                form={form}
              >
                <Row gutter={[6, 6]} justify="space-between">
                  <Col flex={"90%"}>
                    <Form.Item<FieldType> label="Message" name="message">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col flex={"10%"}>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                      >
                        Send
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SSEComponent;
