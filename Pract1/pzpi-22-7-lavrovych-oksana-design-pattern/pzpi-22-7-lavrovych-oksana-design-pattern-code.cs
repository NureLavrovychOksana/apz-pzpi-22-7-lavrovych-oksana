// Цільовий інтерфейс, який очікує клієнт
public interface IMediaPlayer
{
    void Play(string audioType, string fileName);
}

// Клас, який потрібно адаптувати (сторонній код)
public class AdvancedMediaPlayer
{
    public void PlayVlc(string fileName)
    {
        Console.WriteLine("Playing vlc file: " + fileName);
    }

    public void PlayMp4(string fileName)
    {
        Console.WriteLine("Playing mp4 file: " + fileName);
    }
}

// Адаптер: реалізує інтерфейс клієнта та використовує AdvancedMediaPlayer
public class MediaAdapter : IMediaPlayer
{
    private readonly AdvancedMediaPlayer _advancedPlayer = new AdvancedMediaPlayer();

    public void Play(string audioType, string fileName)
    {
        if (audioType.ToLower() == "vlc")
            _advancedPlayer.PlayVlc(fileName);
        else if (audioType.ToLower() == "mp4")
            _advancedPlayer.PlayMp4(fileName);
        else
            Console.WriteLine("Format not supported: " + audioType);
    }
}

// Клієнтський клас, який працює тільки з IMediaPlayer
public class AudioPlayer : IMediaPlayer
{
    private MediaAdapter? _adapter;

    public void Play(string audioType, string fileName)
    {
        if (audioType.ToLower() == "mp3")
        {
            Console.WriteLine("Playing mp3 file: " + fileName);
        }
        else if (audioType.ToLower() == "vlc" || audioType.ToLower() == "mp4")
        {
            _adapter = new MediaAdapter();
            _adapter.Play(audioType, fileName);
        }
        else
        {
            Console.WriteLine("Invalid media. " + audioType + " format not supported.");
        }
    }
}

class Program
{
    static void Main(string[] args)
    {
        IMediaPlayer player = new AudioPlayer();
        player.Play("mp3", "song.mp3");
        player.Play("mp4", "movie.mp4");
        player.Play("vlc", "video.vlc");
        player.Play("avi", "file.avi");
    }
}

