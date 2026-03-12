import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useCharacter } from '../../CharacterContext';
import { ORIGINS } from '../CharacterScreen/logic/originsData';

const getOriginImage = (originName) => {
  if (!originName) return null;
  const found = ORIGINS.find(o => o.name === originName);
  return found ? found.image : null;
};

const NUM_COLS = 3;

const CreateCell = ({ onPress }) => (
  <TouchableOpacity style={styles.createCell} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.createPlus}>+</Text>
    <Text style={styles.createLabel}>Создать{'\n'}персонажа</Text>
  </TouchableOpacity>
);

const CharacterCell = ({ character, onPress, onLongPress }) => {
  const originImage = getOriginImage(character.originName);
  return (
    <TouchableOpacity
      style={styles.characterCell}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.characterImageContainer}>
        {originImage ? (
          <Image source={originImage} style={styles.characterImage} resizeMode="cover" />
        ) : (
          <View style={styles.characterImagePlaceholder}>
            <Text style={styles.characterImagePlaceholderText}>?</Text>
          </View>
        )}
      </View>
      <Text style={styles.characterName} numberOfLines={2}>{character.name}</Text>
      {character.level ? (
        <Text style={styles.characterLevel}>Ур. {character.level}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const EmptyCell = () => <View style={styles.emptyCell} />;

export default function HomeScreen({ onCreateCharacter, onOpenCharacter }) {
  const { getCharactersList, loadCharacter, resetCharacter, deleteCharacter } = useCharacter();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getCharactersList();
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setCharacters(list);
    } catch (e) {
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }, [getCharactersList]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleCreate = () => {
    resetCharacter();
    onCreateCharacter();
  };

  const handleOpen = async (id) => {
    const ok = await loadCharacter(id);
    if (ok) {
      onOpenCharacter();
    }
  };

  const handleLongPress = (character) => {
    Alert.alert(
      character.name,
      'Что сделать с персонажем?',
      [
        { text: 'Открыть', onPress: () => handleOpen(character.id) },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await deleteCharacter(character.id);
            loadList();
          },
        },
        { text: 'Отмена', style: 'cancel' },
      ]
    );
  };

  // Строим список ячеек: [create, ...chars]
  const allItems = [
    { type: 'create' },
    ...characters.map(c => ({ type: 'character', ...c })),
  ];

  // Разбиваем на строки по NUM_COLS
  const rows = [];
  for (let i = 0; i < allItems.length; i += NUM_COLS) {
    rows.push(allItems.slice(i, i + NUM_COLS));
  }
  // Дополняем последнюю строку пустыми ячейками
  if (rows.length > 0) {
    const lastRow = rows[rows.length - 1];
    while (lastRow.length < NUM_COLS) {
      lastRow.push({ type: 'empty', id: `empty_${lastRow.length}` });
    }
  }

  return (
    <ImageBackground
      source={require('../../../assets/bg.png')}
      style={styles.background}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Менеджер персонажей</Text>
          <Text style={styles.subtitle}>Ролевая игра Fallout (2d20)</Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#d4af37" style={styles.loader} />
          ) : (
            rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((item, colIndex) => {
                  if (item.type === 'create') {
                    return <CreateCell key="create" onPress={handleCreate} />;
                  }
                  if (item.type === 'empty') {
                    return <EmptyCell key={item.id} />;
                  }
                  return (
                    <CharacterCell
                      key={item.id}
                      character={item}
                      onPress={() => handleOpen(item.id)}
                      onLongPress={() => handleLongPress(item)}
                    />
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
  },
  title: {
    color: '#f0e68c',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 24,
  },
  loader: {
    marginTop: 60,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  createCell: {
    flex: 1,
    margin: 5,
    aspectRatio: 0.75,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#5a5a5a',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPlus: {
    fontSize: 48,
    color: '#5a5a5a',
    lineHeight: 56,
    fontWeight: '200',
  },
  createLabel: {
    fontSize: 12,
    color: '#5a5a5a',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  characterCell: {
    flex: 1,
    margin: 5,
    aspectRatio: 0.75,
    borderWidth: 1,
    borderColor: '#5a5a5a',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    overflow: 'hidden',
  },
  characterImageContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  characterImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c8c8c8',
  },
  characterImagePlaceholderText: {
    fontSize: 36,
    color: '#888',
  },
  characterName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 2,
  },
  characterLevel: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    paddingBottom: 4,
  },
  emptyCell: {
    flex: 1,
    margin: 5,
    aspectRatio: 0.75,
  },
});
