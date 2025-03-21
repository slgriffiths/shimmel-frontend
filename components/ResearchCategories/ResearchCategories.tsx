"use client"; // 🔥 This forces the component to be client-rendered

import { Card, Typography, Row, Col } from "antd";
import styles from "./ResearchCategories.module.scss";

const { Title, Paragraph } = Typography;

const qualitativeResearch = [
  { title: "User Interviews", description: "Gather deep insights through structured conversations." },
  { title: "Focus Groups", description: "Understand group dynamics and collective viewpoints." },
  { title: "Ethnographic Research", description: "Observe behaviors in real-life environments." },
];

const quantitativeResearch = [
  { title: "Surveys", description: "Collect structured responses for statistical analysis." },
  { title: "A/B Testing", description: "Compare variations to determine the best outcome." },
  { title: "Usage Analytics", description: "Measure user engagement and behavioral trends." },
];

export default function ResearchCategories() {
  return (
    <div className={styles.container}>
      <Title level={3}>Qualitative Research</Title>
      <Row gutter={[16, 16]}>
        {qualitativeResearch.map((item, index) => (
          <Col key={index} xs={24} sm={12} md={8}>
            <Card className={styles.researchCard} hoverable>
              <Title level={4} className={styles.cardTitle}>{item.title}</Title>
              <Paragraph className={styles.cardDescription}>{item.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Title level={3} className={styles.sectionTitle}>Quantitative Research</Title>
      <Row gutter={[16, 16]}>
        {quantitativeResearch.map((item, index) => (
          <Col key={index} xs={24} sm={12} md={8}>
            <Card className={styles.researchCard} hoverable>
              <Title level={4} className={styles.cardTitle}>{item.title}</Title>
              <Paragraph className={styles.cardDescription}>{item.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}