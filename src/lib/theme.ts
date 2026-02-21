import { ThemeConfig } from 'antd';

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorText: '#000000d9',
    colorTextSecondary: '#00000073',
    colorBorder: '#d9d9d9',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#f5f5f5',
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Button: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 12,
    },
    Table: {
      borderRadius: 8,
    },
    Upload: {
      borderRadius: 8,
    },
  },
};

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#000000',
    colorText: '#ffffffd9',
    colorTextSecondary: '#ffffff73',
    colorBorder: '#424242',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#000000',
      headerBg: '#141414',
      siderBg: '#141414',
    },
    Button: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 12,
    },
    Table: {
      borderRadius: 8,
    },
    Upload: {
      borderRadius: 8,
    },
  },
};