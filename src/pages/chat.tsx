import React, { useState, useRef } from "react";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import {
  Button,
  Layout,
  Menu,
  theme,
  Form,
  Input,
  Row,
  Col,
  Typography,
  Card,
  Space,
} from "antd";
import type { FormProps } from "antd";

const { Title } = Typography;

import { MessageContent } from "@langchain/core/messages";

import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { useForm } from "antd/es/form/Form";
import useAutoScroll from "./hook/useAutoScroll";

import { useLocalStorage } from "usehooks-ts";

const { Header, Sider, Content } = Layout;

type FieldType = {
  message?: string;
};

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
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

  const [messages, setMessages, removeValue] = useLocalStorage<
    {
      dt: string;
      message: string;
      result: string;
    }[]
  >("message", []);

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

    try {
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
    } catch (error) {}

    setLoading(false);
  }

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    if (values.message) {
      getChat(values.message ?? "");
      scrollRef?.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    form.setFieldValue("message", undefined);
  };

  const handleOnClear = () => {
    removeValue();
  };

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={
            messages.map((i) => ({
              label: (
                <a href={`#${i.dt}`} style={{ display: "block" }}>
                  {i.message}
                </a>
              ),
              key: i.dt,
            })) || []
          }
        />
      </Sider>
      <Layout style={{ height: "100vh" }}>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Space>
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
          </Space>
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
              <Row gutter={[12, 12]}>
                {messages.map((message, index) => {
                  return (
                    <Col span={24} key={message.dt}>
                      <Card>
                        <Title id={message.dt} level={4}>
                          {message.message}
                        </Title>

                        <Markdown
                          className="typewriter"
                          rehypePlugins={[rehypeHighlight]}
                        >
                          {message.result}
                        </Markdown>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
              <div ref={scrollRef}></div>
            </Col>
            <Col span={24}>
              <Form onFinish={onFinish} form={form}>
                <Row gutter={[6, 6]} justify="space-between">
                  <Col flex={"80%"}>
                    <Form.Item<FieldType> label="Message" name="message">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col flex={"10%"}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                    >
                      Send
                    </Button>
                  </Col>
                  <Col flex={"10%"}>
                    <Button type="primary" danger block onClick={handleOnClear}>
                      Clear
                    </Button>
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
