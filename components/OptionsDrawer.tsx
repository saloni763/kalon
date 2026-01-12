import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { ReactNode } from 'react';

interface SVGIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export interface OptionItem {
  id: string;
  icon: ReactNode;
  text: string;
  onPress: () => void;
  isDanger?: boolean;
}

interface OptionsDrawerProps {
  visible: boolean;
  onClose: () => void;
  options: OptionItem[];
  iconColor?: string;
  iconSize?: number;
}

export default function OptionsDrawer({
  visible,
  onClose,
  options,
  iconColor = '#AF7DFF',
  iconSize = 24,
}: OptionsDrawerProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />
        <View style={styles.content}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Options List */}
          <View style={styles.optionsList}>
            {options.map((option, index) => (
              <React.Fragment key={option.id}>
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    option.onPress();
                    onClose();
                  }}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      option.isDanger && styles.iconContainerDanger,
                    ]}
                  >
                    {React.isValidElement(option.icon)
                      ? React.cloneElement(option.icon as React.ReactElement<SVGIconProps>, {
                          width: iconSize,
                          height: iconSize,
                          color: option.isDanger ? '#FF3B30' : iconColor,
                        })
                      : option.icon}
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      option.isDanger && styles.optionTextDanger,
                    ]}
                  >
                    {option.text}
                  </Text>
                </TouchableOpacity>
                {index < options.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EEFF',
    borderRadius: 20,
  },
  iconContainerDanger: {
    backgroundColor: '#FFEEEE',
  },
  optionText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  optionTextDanger: {
    color: '#FF3B30',
    fontFamily: 'Montserrat_600SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 40,
  },
});

