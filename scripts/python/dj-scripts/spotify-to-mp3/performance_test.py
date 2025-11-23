import os
import sys
import time
import shutil
import logging
from typing import List, Dict
from dotenv import load_dotenv
from spotify_to_mp3_service import SpotifyToMp3Service
from download_music import get_spotify_playlists


class FlushingFileHandler(logging.FileHandler):
    def emit(self, record):
        super().emit(record)
        self.flush()


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.propagate = False  # Prevent duplicate logs from root logger

formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

file_handler = FlushingFileHandler("performance_test.log", mode="w")
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(console_handler)

load_dotenv()


class PerformanceTest:
    def __init__(
        self,
        start_parallel: int = 20,
        max_parallel: int = 30,
        step_parallel: int = 5,
        max_failure_rate: float = 0.1,
        test_output_dir: str = "~/performance_test_downloads",
    ):
        self.start_parallel = start_parallel
        self.max_parallel = max_parallel
        self.max_failure_rate = max_failure_rate
        self.test_output_dir = os.path.expanduser(test_output_dir)
        self.results = []
        self.step_parallel = step_parallel

    def cleanup_test_directory(self):
        if os.path.exists(self.test_output_dir):
            shutil.rmtree(self.test_output_dir)

    def test_parallel_level(
        self, playlists: List[Dict], parallel_downloads: int
    ) -> Dict:
        logger.info(f"\n{'='*80}")
        logger.info(f"Testing PARALLEL_DOWNLOADS={parallel_downloads}")
        self.cleanup_test_directory()

        service = SpotifyToMp3Service(
            output=self.test_output_dir,
            parallel_downloads=parallel_downloads,
        )

        start_time = time.time()

        try:
            service.download_playlists(playlists)
            success = True
        except Exception as e:
            logger.error(f"Critical failure during test: {e}")
            success = False

        duration = time.time() - start_time

        expected_dirs = {p["name"] for p in playlists}
        actual_dirs = set()

        if os.path.exists(self.test_output_dir):
            actual_dirs = {
                name
                for name in os.listdir(self.test_output_dir)
                if os.path.isdir(os.path.join(self.test_output_dir, name))
            }

        successful_playlists = len(expected_dirs & actual_dirs)
        total_playlists = len(playlists)
        success_rate = (
            successful_playlists / total_playlists if total_playlists > 0 else 0
        )
        failure_rate = 1 - success_rate

        result = {
            "parallel_downloads": parallel_downloads,
            "total_playlists": total_playlists,
            "successful_playlists": successful_playlists,
            "success_rate": success_rate,
            "failure_rate": failure_rate,
            "duration": duration,
            "avg_time_per_playlist": (
                duration / total_playlists if total_playlists > 0 else 0
            ),
            "overall_success": success,
        }

        logger.info(
            f"  Success Rate: {success_rate*100:.1f}% ({successful_playlists}/{total_playlists})"
        )
        logger.info(f"  Duration: {duration:.2f}s")
        logger.info(f"  Avg Time/Playlist: {result['avg_time_per_playlist']:.2f}s")
        logger.info(f"  Failure Rate: {failure_rate*100:.1f}%")

        return result

    def run_test(self):
        logger.info("=" * 80)
        logger.info(f"Configuration:")
        logger.info(f"  Starting parallel downloads: {self.start_parallel}")
        logger.info(f"  Max parallel downloads to test: {self.max_parallel}")
        logger.info(f"  Max acceptable failure rate: {self.max_failure_rate*100:.1f}%")
        test_playlists = get_spotify_playlists()[:30]  # Limit to first 30 for testing
        logger.info(f"Using {len(test_playlists)} playlists for testing")

        optimal_parallel = self.start_parallel
        best_result = None

        for parallel in range(
            self.start_parallel,
            min(self.max_parallel, len(test_playlists)) + 1,
            self.step_parallel,
        ):
            result = self.test_parallel_level(test_playlists, parallel)
            self.results.append(result)

            # Check if we've hit too many failures
            if result["failure_rate"] > self.max_failure_rate:
                logger.warning(
                    f"\nFailure rate ({result['failure_rate']*100:.1f}%) "
                    f"exceeded threshold ({self.max_failure_rate*100:.1f}%)"
                )
                logger.info("Stopping tests - found upper limit of parallel downloads")
                break

            # Track best result (100% success rate with fastest time)
            if result["success_rate"] == 1.0:
                optimal_parallel = parallel
                best_result = result

        # Clean up test directory
        self.cleanup_test_directory()

        # Report results
        self.print_summary(optimal_parallel, best_result)

        return optimal_parallel, self.results

    def print_summary(self, optimal_parallel: int, best_result: Dict):
        """Print summary of test results"""
        logger.info("\n" + "=" * 80)
        logger.info("TEST SUMMARY - MAX PARALLEL DOWNLOADS")
        logger.info("=" * 80)

        if best_result:
            logger.info(
                f"\nOPTIMAL CONFIGURATION: PARALLEL_DOWNLOADS={optimal_parallel}"
            )
            logger.info(f"\nBest Performance:")
            logger.info(f"  Success Rate: 100%")
            logger.info(f"  Total Duration: {best_result['duration']:.2f}s")
            logger.info(
                f"  Avg Time/Playlist: {best_result['avg_time_per_playlist']:.2f}s"
            )
            logger.info(
                f"  Throughput: {best_result['total_playlists']/best_result['duration']:.2f} playlists/sec"
            )
        else:
            logger.warning("\nNo configuration achieved 100% success rate")
            logger.info("API failures occurred at all tested parallelism levels")

        logger.info(f"\nAll Test Results:")
        logger.info(
            f"{'Parallel':<10} {'Success':<15} {'Failed':<10} {'Duration':<12} {'Throughput':<15}"
        )
        logger.info(f"{'-'*10} {'-'*15} {'-'*10} {'-'*12} {'-'*15}")

        for result in self.results:
            throughput = (
                result["total_playlists"] / result["duration"]
                if result["duration"] > 0
                else 0
            )
            failed_count = result["total_playlists"] - result["successful_playlists"]
            logger.info(
                f"{result['parallel_downloads']:<10} "
                f"{result['success_rate']*100:>6.1f}%{'':<8} "
                f"{failed_count:<10} "
                f"{result['duration']:>8.2f}s{'':<4} "
                f"{throughput:>8.2f} pl/s"
            )

        logger.info("\n" + "=" * 80)
        if self.results:
            last_result = self.results[-1]
            if last_result["failure_rate"] > self.max_failure_rate:
                logger.info(f"Maximum safe parallel downloads: {optimal_parallel}")
                logger.info(
                    f"API started failing at: {last_result['parallel_downloads']} parallel downloads"
                )
            else:
                logger.info(
                    f"Tested up to {result["total_playlists"]} parallel downloads without hitting failure threshold"
                )


def main():
    test = PerformanceTest()

    try:
        test.run_test()
        sys.exit(0)
    except KeyboardInterrupt:
        logger.info("\n\nTest interrupted by user")
        test.cleanup_test_directory()
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n\nTest failed with error: {e}", exc_info=True)
        test.cleanup_test_directory()
        sys.exit(1)


if __name__ == "__main__":
    main()
